import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { REFERRER_BPS } from '@/lib/fees';

export const runtime = 'nodejs';

// Afrondingsmarge (lamports) op het verwachte 25%-aandeel.
const RATIO_TOLERANCE = 3;

function feeWalletAddr(): string | null {
  const raw = process.env.NEXT_PUBLIC_FEE_WALLET;
  if (!raw) return null;
  try { return new PublicKey(raw).toBase58(); } catch { return null; }
}

/**
 * POST /api/referral/record  — body: { txSignature }
 *
 * De ENIGE plek waar een binding + payout ontstaan. Alles wordt uit de geverifieerde tx
 * gelezen; de request-body wordt NIET vertrouwd (alleen de signature). Een binding kan dus
 * niet vervalst worden voor een wallet die nooit gesweept heeft:
 *  - referred_wallet = de fee-payer/signer van de tx (kan een aanvaller niet vervalsen);
 *  - er MOET een SystemProgram-transfer naar onze officiële fee-wallet in de tx zitten
 *    (bewijst dat het een sweep van onze app is);
 *  - referrer_wallet = de ontvanger van de tweede (niet-fee-wallet) transfer;
 *  - het referrer-aandeel moet ≈ 25% van de totale fee zijn (75/25, met marge).
 * Idempotent op tx_signature (unieke constraint in referral_payouts).
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 }); }

  const txSignature = String(body.txSignature ?? '').trim();
  if (!txSignature) return NextResponse.json({ ok: false, error: 'no signature' }, { status: 400 });

  const rpc = process.env.HELIUS_RPC_URL;
  const feeWallet = feeWalletAddr();
  // Zonder RPC of bekende fee-wallet kunnen we niets bewijzen → fail-closed, niets vastleggen.
  if (!rpc || !feeWallet) {
    return NextResponse.json({ ok: false, error: 'not verifiable on this server' }, { status: 503 });
  }

  let referred = '';
  let referrer = '';
  let referrerShareLamports = 0;
  let feeLamports = 0;

  try {
    const conn = new Connection(rpc, 'confirmed');
    const tx = await conn.getParsedTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (!tx || tx.meta?.err) {
      return NextResponse.json({ ok: false, error: 'tx not confirmed' }, { status: 400 });
    }

    // Fee-payer = de eerste account-key = de wallet die de tx tekende (de sweeper).
    const payer = tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();
    if (!payer) return NextResponse.json({ ok: false, error: 'no fee payer' }, { status: 400 });

    // SystemProgram-transfers vanaf de fee-payer (top-level; onze fee/referral-transfers
    // worden direct aan de tx toegevoegd).
    const transfers: { dest: string; lamports: number }[] = [];
    for (const ix of tx.transaction.message.instructions) {
      if ('parsed' in ix && ix.program === 'system' && ix.parsed?.type === 'transfer') {
        const info = ix.parsed.info as { source?: string; destination?: string; lamports?: number };
        if (info.source === payer && info.destination && typeof info.lamports === 'number') {
          transfers.push({ dest: info.destination, lamports: info.lamports });
        }
      }
    }

    const toFee = transfers.find((t) => t.dest === feeWallet);
    const toReferrer = transfers.find((t) => t.dest !== feeWallet && t.dest !== payer);

    // Geen transfer naar onze fee-wallet → geen sweep van onze app.
    if (!toFee) return NextResponse.json({ ok: false, error: 'no platform fee transfer' }, { status: 400 });
    // Geen referrer-transfer → gewone sweep zonder referral; niets te tracken (geen fout).
    if (!toReferrer) return NextResponse.json({ ok: true, tracked: false });

    referred = payer;
    referrer = toReferrer.dest;
    referrerShareLamports = toReferrer.lamports;
    feeLamports = toFee.lamports + toReferrer.lamports; // totale fee = 75% + 25%

    if (referred === referrer) {
      return NextResponse.json({ ok: false, error: 'self-referral' }, { status: 400 });
    }

    // 75/25-ratio: het referrer-aandeel moet ≈ 25% van de totale fee zijn (marge voor afronding).
    const expectedReferrer = Math.floor((feeLamports * REFERRER_BPS) / 10_000);
    if (Math.abs(referrerShareLamports - expectedReferrer) > RATIO_TOLERANCE) {
      return NextResponse.json({ ok: false, error: 'unexpected split ratio' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'verify failed' }, { status: 502 });
  }

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, tracked: false });

  // Binding: eerste sweep legt vast (referred → referrer, beide uit de tx). Bestaande blijft.
  await db.from('referral_bindings').upsert(
    { referred_wallet: referred, referrer_wallet: referrer },
    { onConflict: 'referred_wallet', ignoreDuplicates: true },
  );

  // Payout: idempotent op de unieke tx_signature.
  await db.from('referral_payouts').upsert(
    {
      referrer_wallet: referrer,
      referred_wallet: referred,
      tx_signature: txSignature,
      fee_lamports: feeLamports,
      referrer_share_lamports: referrerShareLamports,
    },
    { onConflict: 'tx_signature', ignoreDuplicates: true },
  );

  return NextResponse.json({ ok: true, tracked: true });
}
