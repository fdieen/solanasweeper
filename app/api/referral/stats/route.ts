import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function isValid(a: string): boolean {
  try { new PublicKey(a); return true; } catch { return false; }
}

type Payout = { tx: string; lamports: number; referred: string; at: string };
const EMPTY = { sweeps: 0, totalLamports: 0, payouts: [] as Payout[] };

/**
 * GET /api/referral/stats?wallet=<base58>
 * Totalen (aantal sweeps + totaal verdiend in lamports) + de laatste payouts voor een
 * referrer-wallet. Faalt nooit hard: lege stats bij ongeldig adres of geen Supabase.
 */
export async function GET(req: Request) {
  const wallet = (new URL(req.url).searchParams.get('wallet') ?? '').trim();
  if (!isValid(wallet)) return NextResponse.json(EMPTY);

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json(EMPTY);

  const referrer = new PublicKey(wallet).toBase58();

  // Exacte totalen via de Postgres-functie.
  const { data: totals } = await db.rpc('referral_totals', { p_referrer: referrer });
  const row = Array.isArray(totals) ? totals[0] : totals;
  const sweeps = Number(row?.sweeps ?? 0);
  const totalLamports = Number(row?.total_lamports ?? 0);

  // Laatste 10 payouts voor de lijst.
  const { data: recent } = await db
    .from('referral_payouts')
    .select('tx_signature, referrer_share_lamports, referred_wallet, created_at')
    .eq('referrer_wallet', referrer)
    .order('created_at', { ascending: false })
    .limit(10);

  const payouts: Payout[] = (recent ?? []).map((r) => ({
    tx: r.tx_signature as string,
    lamports: Number(r.referrer_share_lamports || 0),
    referred: r.referred_wallet as string,
    at: r.created_at as string,
  }));

  return NextResponse.json({ sweeps, totalLamports, payouts });
}
