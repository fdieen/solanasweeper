'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { getProxyConnection, pollConfirm } from '@/lib/solanaProxy';
import { scanHoldings, valuateAll } from '@/lib/holdings';
import { classifyHoldings, type TokenHolding, type Valuation } from '@/lib/classify';
import { buildBatches, summarize, lamportsToSol, FEE_BPS, MIN_SOL_FOR_CLOSE, MIN_SOL_FOR_SWAP } from '@/lib/funMode';
import { buildBurnBatches, filterBurnSafe } from '@/lib/proMode';
import { getQuote, buildSwapTransaction } from '@/lib/jupiter';
import { resolveReferrer, recordReferralPayout } from '@/lib/referral';
import { splitFee } from '@/lib/fees';
import { lowGasNotice } from '@/lib/messages';

type AnyTx = Transaction | VersionedTransaction;
type SolanaSigner = {
  signTransaction?: <T extends AnyTx>(tx: T) => Promise<T>;
  signAllTransactions?: <T extends AnyTx>(txs: T[]) => Promise<T[]>;
  signAndSendTransaction?: (tx: AnyTx) => Promise<string>;
};

type Phase = 'idle' | 'scanning' | 'ready' | 'confirm' | 'working' | 'done' | 'error';
type ProResult = { closed: number; swapped: number; burned: number; skipped: number; sol: number };

const FEE_ACCOUNT = process.env.NEXT_PUBLIC_JUP_FEE_ACCOUNT || undefined;
const key = (h: TokenHolding) => h.tokenAccount.toBase58();
const shortMint = (m: PublicKey) => `${m.toBase58().slice(0, 4)}…${m.toBase58().slice(-4)}`;

export default function ProMode() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  const [phase, setPhase] = useState<Phase>('idle');
  const [empty, setEmpty] = useState<TokenHolding[]>([]);
  const [swap, setSwap] = useState<TokenHolding[]>([]);
  const [burn, setBurn] = useState<TokenHolding[]>([]);
  const [nft, setNft] = useState<TokenHolding[]>([]);
  const [valuations, setValuations] = useState<Map<string, Valuation>>(new Map());

  // Selecties (tokenAccount-keys). Swap voorgevinkt; burn/nft NOOIT.
  const [swapSel, setSwapSel] = useState<Set<string>>(new Set());
  const [burnSel, setBurnSel] = useState<Set<string>>(new Set());
  const [nftSel, setNftSel] = useState<Set<string>>(new Set());

  const [ackPermanent, setAckPermanent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [balance, setBalance] = useState<number | null>(null); // wallet-SOL, voor de gas-check in de render
  const [result, setResult] = useState<ProResult | null>(null);
  // Wat er zojuist is opgeschoond (na bevestiging). Zolang gezet: toon de success-banner
  // en (na de herscan) de verse staat.
  const [swept, setSwept] = useState<ProResult | null>(null);
  const [referrer, setReferrer] = useState<PublicKey | null>(null); // gevalideerde referrer of null

  const scan = useCallback(async () => {
    if (!address) return;
    setPhase('scanning');
    setErrorMsg('');
    try {
      const conn = getProxyConnection();
      const owner = new PublicKey(address);
      conn.getBalance(owner).then(setBalance).catch(() => {}); // gas-check in de render
      const holdings = await scanHoldings(conn, owner);
      const vals = await valuateAll(holdings);
      const buckets = classifyHoldings(holdings, vals);
      setEmpty(buckets.empty);
      setSwap(buckets.swap);
      setBurn(buckets.burn);
      setNft(buckets.nft);
      setValuations(vals);
      // Swap voorgevinkt (waarde behouden); burn/nft leeg laten
      setSwapSel(new Set(buckets.swap.map(key)));
      setBurnSel(new Set());
      setNftSel(new Set());
      setAckPermanent(false);
      setPhase('ready');
    } catch (e) {
      console.error('Pro scan failed', e);
      setErrorMsg('Could not scan your wallet (RPC). Try again.');
      setPhase('error');
    }
  }, [address]);

  // Onthoudt voor welk adres we al gescand hebben. Voorkomt dat een reconnect/
  // re-render (Reown pingt de sessie) telkens een dure DAS/program-account-scan afvuurt.
  const scannedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    // Ref bewust NIET resetten op disconnect: een reconnect-flikker (zelfde wallet)
    // scant zo niet opnieuw — dat was de dure DAS/program-account-drain.
    if (scannedFor.current === address) return;
    scannedFor.current = address;
    scan();
  }, [isConnected, address, scan]);

  // Ander wallet-adres → een eventuele success-banner is niet meer relevant.
  useEffect(() => { setSwept(null); }, [address]);

  const toggle = (set: Set<string>, k: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setter(next);
  };

  // Totalen voor het bevestigingsscherm
  const totals = useMemo(() => {
    const emptyRent = empty.reduce((s, a) => s + a.lamports, 0);
    const burnItems = [...burn, ...nft].filter((h) => burnSel.has(key(h)) || nftSel.has(key(h)));
    const burnRent = burnItems.reduce((s, a) => s + a.lamports, 0);
    const swapItems = swap.filter((h) => swapSel.has(key(h)));
    const swapOut = swapItems.reduce((s, h) => s + (valuations.get(h.mint.toBase58())?.outLamports ?? 0), 0);
    const gross = emptyRent + burnRent + swapOut;
    const fee = Math.floor((gross * FEE_BPS) / 10_000);
    return {
      emptyCount: empty.length,
      swapCount: swapItems.length,
      burnCount: burnItems.length,
      grossSol: lamportsToSol(gross),
      feeSol: lamportsToSol(fee),
      netSol: lamportsToSol(gross - fee),
      hasBurn: burnItems.length > 0,
    };
  }, [empty, burn, nft, swap, burnSel, nftSel, swapSel, valuations]);

  async function signGroup<T extends AnyTx>(txs: T[]): Promise<T[]> {
    const signer = walletProvider as SolanaSigner;
    if (txs.length === 0) return [];
    if (signer.signAllTransactions) return signer.signAllTransactions(txs);
    if (signer.signTransaction) {
      const out: T[] = [];
      for (const tx of txs) out.push(await signer.signTransaction(tx));
      return out;
    }
    throw new Error('Wallet cannot sign transactions');
  }

  async function sendAndCount(conn: ReturnType<typeof getProxyConnection>, signed: AnyTx[], countPerTx: number[]) {
    let ok = 0;
    let skipped = 0;
    const confirmedTxs: { i: number; sig: string }[] = [];
    for (let i = 0; i < signed.length; i++) {
      try {
        const tx = signed[i];
        const sim = tx instanceof VersionedTransaction
          ? await conn.simulateTransaction(tx)
          : await conn.simulateTransaction(tx);
        if (sim.value.err) { skipped += countPerTx[i]; continue; }
        const sig = await conn.sendRawTransaction(signed[i].serialize(), { skipPreflight: false, maxRetries: 3 });
        const confirmed = await pollConfirm(conn, sig);
        if (confirmed) { ok += countPerTx[i]; confirmedTxs.push({ i, sig }); }
        else skipped += countPerTx[i];
      } catch (e) {
        console.error('tx failed', e);
        skipped += countPerTx[i];
      }
    }
    return { ok, skipped, confirmed: confirmedTxs };
  }

  // Burn-send via de wallet-adapter's signAndSendTransaction: de wallet tekent
  // én verstuurt zelf (de aanbevolen, "veilige" Phantom-route), i.p.v. onze
  // eigen sendRawTransaction. Confirm-polling blijft via onze proxy-connection.
  // signAndSendTransaction is per-tx (geen batch), dus burns tekenen los.
  async function signAndSendGroup(conn: ReturnType<typeof getProxyConnection>, txs: AnyTx[], countPerTx: number[]) {
    const signer = walletProvider as SolanaSigner;
    let ok = 0;
    let skipped = 0;
    const confirmedTxs: { i: number; sig: string }[] = [];
    if (txs.length === 0) return { ok, skipped, confirmed: confirmedTxs };
    if (!signer.signAndSendTransaction) {
      throw new Error('Wallet does not support signAndSendTransaction');
    }
    for (let i = 0; i < txs.length; i++) {
      try {
        const sig = await signer.signAndSendTransaction(txs[i]);
        const confirmed = await pollConfirm(conn, sig);
        if (confirmed) { ok += countPerTx[i]; confirmedTxs.push({ i, sig }); }
        else skipped += countPerTx[i];
      } catch (e) {
        console.error('burn tx failed', e);
        skipped += countPerTx[i];
      }
    }
    return { ok, skipped, confirmed: confirmedTxs };
  }

  async function execute() {
    if (!address) return;
    setPhase('working');
    setErrorMsg('');
    setSwept(null);
    try {
      const conn = getProxyConnection();
      const owner = new PublicKey(address);

      // Gas-poort: te weinig SOL → de fee-payer kan de tx niet laten simuleren,
      // wat in Phantom een rode warning geeft. Vang dat hier rustig af i.p.v.
      // de wallet te openen. Stuurt NIETS naar Phantom als de balance te laag is.
      // Drempel hangt af van het pad: een swap-selectie vraagt de swap-drempel (transient
      // wSOL-rent), een puur close/burn-run alleen de lagere close-drempel.
      const minGas = swapSel.size > 0 ? MIN_SOL_FOR_SWAP : MIN_SOL_FOR_CLOSE;
      const bal = await conn.getBalance(owner);
      setBalance(bal);
      if (bal < minGas) { setPhase('ready'); return; }

      // ── Verse herclassificatie net vóór bouwen ──
      const freshHoldings = await scanHoldings(conn, owner);
      const freshVals = await valuateAll(freshHoldings);
      const fresh = classifyHoldings(freshHoldings, freshVals);

      // Selectie projecteren op de VERSE buckets (op tokenAccount-key)
      const freshEmpty = fresh.empty; // empties altijd veilig sluiten
      const freshSwap = fresh.swap.filter((h) => swapSel.has(key(h)));
      const selectedBurnRaw = [...fresh.burn, ...fresh.nft].filter(
        (h) => burnSel.has(key(h)) || nftSel.has(key(h))
      );

      // ── HARD GUARD: filterBurnSafe krijgt de selectie, buildBurnBatches alleen 'safe' ──
      const { safe: burnSafe, rejected: burnRejected } = filterBurnSafe(selectedBurnRaw, freshVals);

      const { blockhash } = await conn.getLatestBlockhash('confirmed');
      const feeWallet = process.env.NEXT_PUBLIC_FEE_WALLET
        ? new PublicKey(process.env.NEXT_PUBLIC_FEE_WALLET)
        : null;

      // Legacy txs: lege accounts sluiten (close) + burn (alleen 'safe') — apart gehouden:
      // closes via onze sendRaw-route, burns via de wallet-adapter (signAndSendTransaction).
      const closeBuilt = buildBatches({ owner, accounts: freshEmpty.map((h) => ({ pubkey: h.tokenAccount, programId: h.programId, lamports: h.lamports })), feeWallet, blockhash, referrer });
      const burnBuilt = buildBurnBatches({ owner, accounts: burnSafe, feeWallet, blockhash, referrer });
      const closeCounts = closeBuilt.batches.map((b) => b.length);
      const burnCounts = burnBuilt.batches.map((b) => b.length);

      // Versioned txs: Jupiter swaps (één per token)
      const versionedTxs: VersionedTransaction[] = [];
      const swapCounts: number[] = [];
      for (const h of freshSwap) {
        const quote = await getQuote(h.mint.toBase58(), h.amountRaw);
        if (!quote) continue;
        const vtx = await buildSwapTransaction(quote, owner.toBase58(), FEE_ACCOUNT);
        versionedTxs.push(vtx);
        swapCounts.push(1);
      }

      // Closes + swaps: vooraf tekenen (sign-all), daarna versturen via sendRaw.
      const signedCloses = await signGroup(closeBuilt.transactions);
      const signedVersioned = await signGroup(versionedTxs);

      const closeRes = await sendAndCount(conn, signedCloses, closeCounts);

      // Burns: wallet tekent én verstuurt zelf (veilige Phantom-route).
      const burnRes = await signAndSendGroup(conn, burnBuilt.transactions, burnCounts);

      const swapRes = await sendAndCount(conn, signedVersioned, swapCounts);

      // Referral-payouts registreren voor bevestigde close- en burn-batches. De fee-split
      // zit alleen op de rent-fee (SystemProgram-transfer), niet op de Jupiter-swap-fee.
      if (referrer && feeWallet) {
        const rec = (accts: { lamports: number }[], sig: string) => {
          const gross = accts.reduce((s, a) => s + a.lamports, 0);
          const fee = Math.floor((gross * FEE_BPS) / 10_000);
          const { referrerLamports } = splitFee(fee, referrer);
          // Alleen de signature melden; de server verifieert + leidt de rest af.
          if (referrerLamports > 0) recordReferralPayout(sig);
        };
        for (const c of closeRes.confirmed) rec(closeBuilt.batches[c.i], c.sig);
        for (const c of burnRes.confirmed) rec(burnBuilt.batches[c.i], c.sig);
      }

      const closedCount = closeRes.ok;
      const burnedCount = burnRes.ok;
      const reclaimedLamports = [...freshEmpty, ...burnSafe].reduce((s, a) => s + a.lamports, 0);
      const netLamports = reclaimedLamports - Math.floor((reclaimedLamports * FEE_BPS) / 10_000);

      const proResult: ProResult = {
        closed: closedCount,
        burned: burnedCount,
        swapped: swapRes.ok,
        skipped: closeRes.skipped + burnRes.skipped + swapRes.skipped + burnRejected.length,
        sol: lamportsToSol(netLamports),
      };
      setResult(proResult);

      // Pas NA on-chain bevestiging: als er iets is opgeschoond, ververs de kaart naar de
      // nieuwe staat (verse herscan) en seinsein de read-only preview — zelfde flow als Fun Mode.
      if (closedCount + burnedCount + swapRes.ok > 0) {
        setSwept(proResult);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sweep-confirmed', { detail: { address } }));
        }
        scan(); // verse buckets ophalen → verwerkte items verdwijnen
      } else {
        setPhase('done'); // niets bevestigd → toon de (skip)samenvatting
      }
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error && /reject|denied|user/i.test(e.message)
        ? 'You cancelled the signature.'
        : 'Something went wrong. No funds moved unless a transaction confirmed.';
      setErrorMsg(msg);
      setPhase('error');
    }
  }

  // Confirm openen: resolve eerst de referrer (voor de fee-split + weergave), dan het scherm.
  async function openConfirm() {
    if (!address) return;
    setAckPermanent(false);
    try { setReferrer(await resolveReferrer(getProxyConnection(), new PublicKey(address))); }
    catch { setReferrer(null); }
    setPhase('confirm');
  }

  if (!isConnected) return null;
  if ((phase === 'scanning' || phase === 'idle') && !swept) return <p style={muted}>Scanning your wallet…</p>;

  const hasContent = swap.length > 0 || burn.length > 0 || nft.length > 0 || empty.length > 0;
  // Iets te doen? Lege accounts sluiten altijd; swap/burn/nft alleen indien geselecteerd.
  const canClean = totals.emptyCount + totals.swapCount + totals.burnCount > 0;
  const minGasNow = swapSel.size > 0 ? MIN_SOL_FOR_SWAP : MIN_SOL_FOR_CLOSE;
  const lowGas = balance != null && balance < minGasNow;
  const showGasWarn = canClean && lowGas; // niet tonen als er niets te vegen valt (dan wint "Nothing to clean")

  return (
    <div style={{ marginTop: '8px' }}>
      {swept && <SweptBanner swept={swept} />}
      {swept && phase === 'scanning' && (
        <p style={{ ...muted, marginTop: '12px' }}>Refreshing your wallet…</p>
      )}
      {swept && phase === 'ready' && !hasContent && (
        <p style={{ ...muted, marginTop: '12px' }}>Nothing left to clean.</p>
      )}

      {(!swept || (phase === 'ready' && hasContent)) && (
      <>
      {/* SWAP */}
      {swap.length > 0 && (
        <Section title={`Swap to SOL · ${swap.length}`} sub="Sold via Jupiter — value preserved.">
          {swap.map((h) => (
            <Row key={key(h)} h={h} checked={swapSel.has(key(h))} onToggle={() => toggle(swapSel, key(h), setSwapSel)}
              right={`~${lamportsToSol(valuations.get(h.mint.toBase58())?.outLamports ?? 0).toFixed(4)} SOL`} />
          ))}
        </Section>
      )}

      {/* BURN (junk fungibles) */}
      {burn.length > 0 && (
        <Section
          title={`Burn junk · ${burn.length}`}
          sub="Permanently destroyed. Off by default — select what you want gone."
          danger
          action={
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={smallBtn} onClick={() => setBurnSel(new Set(burn.map(key)))}>Select all junk</button>
              <button style={{ ...smallBtn, opacity: burnSel.size === 0 ? 0.4 : 1, cursor: burnSel.size === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setBurnSel(new Set())} disabled={burnSel.size === 0}>Deselect all</button>
            </div>
          }
        >
          {burn.map((h) => (
            <BurnRow key={key(h)} h={h} checked={burnSel.has(key(h))} onToggle={() => toggle(burnSel, key(h), setBurnSel)} />
          ))}
        </Section>
      )}

      {/* BURN NFTs */}
      {nft.length > 0 && (
        <Section
          title={`Burn NFTs · ${nft.length}`}
          sub="Permanently destroyed. Off by default."
          danger
          action={
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={smallBtn} onClick={() => setNftSel(new Set(nft.map(key)))}>Select all</button>
              <button style={{ ...smallBtn, opacity: nftSel.size === 0 ? 0.4 : 1, cursor: nftSel.size === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setNftSel(new Set())} disabled={nftSel.size === 0}>Deselect all</button>
            </div>
          }
        >
          {nft.map((h) => (
            <BurnRow key={key(h)} h={h} checked={nftSel.has(key(h))} onToggle={() => toggle(nftSel, key(h), setNftSel)} />
          ))}
        </Section>
      )}

      {empty.length > 0 && (
        <p style={{ ...muted, marginTop: '10px' }}>+ {empty.length} empty account{empty.length === 1 ? '' : 's'} will be closed for rent.</p>
      )}

      {/* Gas-blokkade: eigen amber waarschuwings-tier, boven de knop, disablet 'm.
          Alleen tonen als er iets te vegen valt — anders spreekt het "Nothing to clean" tegen. */}
      {showGasWarn && (
        <div style={warn}>
          {warnIcon}
          <span>{lowGasNotice(minGasNow)}</span>
        </div>
      )}

      <button
        style={{ ...primaryBtn, marginTop: '16px', opacity: (canClean && !lowGas) ? 1 : 0.4, cursor: (canClean && !lowGas) ? 'pointer' : 'not-allowed' }}
        disabled={!canClean || lowGas}
        onClick={openConfirm}
      >
        {canClean ? 'Review & sign' : 'Nothing to clean'}
      </button>

      {phase === 'working' && <p style={{ ...muted, marginTop: '8px' }}>Working — approve in your wallet…</p>}
      {phase === 'error' && errorMsg && <p style={{ ...muted, marginTop: '8px', color: 'rgba(255,140,140,0.85)' }}>{errorMsg}</p>}
      {phase === 'done' && result && (
        <p style={{ ...muted, marginTop: '8px', color: '#14F195' }}>
          {result.closed} closed · {result.swapped} swapped · {result.burned} burned · {result.sol.toFixed(4)} SOL{result.skipped ? ` · ${result.skipped} skipped` : ''}
        </p>
      )}

      {/* Bevestigingsscherm — via portal naar <body> (parent-kaart heeft backdrop-filter,
          wat een fixed-overlay anders inklemt i.p.v. viewport-breed te tonen). */}
      {phase === 'confirm' && typeof document !== 'undefined' && createPortal(
        <div style={overlay} onClick={() => setPhase('ready')}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>Confirm cleanup</h3>

            <KV label={`Close ${totals.emptyCount} empty + swap ${totals.swapCount}`} />
            <KV label="Gross" value={`${totals.grossSol.toFixed(4)} SOL`} />
            <KV label={`Fee (${FEE_BPS / 100}%)`} value={`− ${totals.feeSol.toFixed(4)} SOL`} dim />
            {referrer && (
              <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'rgba(20,241,149,0.85)', lineHeight: 1.4 }}>
                Referral active — 25% of the fee on closed/burned accounts goes to your referrer, paid in the transaction.
              </p>
            )}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <KV label="You receive" value={`${totals.netSol.toFixed(4)} SOL`} highlight />

            {totals.hasBurn && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'rgba(255,60,80,0.08)', border: '1px solid rgba(255,80,100,0.35)' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#ff8b8b', fontSize: '0.9rem' }}>
                  ⚠ {totals.burnCount} item{totals.burnCount === 1 ? '' : 's'} will be PERMANENTLY burned
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                  Burning cannot be undone. The tokens/NFTs are gone forever.
                </p>
                <div
                  role="checkbox"
                  aria-checked={ackPermanent}
                  tabIndex={0}
                  onClick={() => setAckPermanent((v) => !v)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAckPermanent((v) => !v); } }}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '0.82rem', color: '#fff' }}
                >
                  <input type="checkbox" checked={ackPermanent} readOnly tabIndex={-1} aria-hidden="true" style={{ pointerEvents: 'none', flexShrink: 0 }} />
                  I understand burning is permanent
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button style={ghostBtn} onClick={() => setPhase('ready')}>Cancel</button>
              <button
                style={{ ...primaryBtn, flex: 1, opacity: totals.hasBurn && !ackPermanent ? 0.4 : 1, cursor: totals.hasBurn && !ackPermanent ? 'not-allowed' : 'pointer' }}
                disabled={totals.hasBurn && !ackPermanent}
                onClick={execute}
              >
                Sign & clean
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </>
      )}
    </div>
  );
}

// Success-banner na een bevestigde Pro-clean.
function SweptBanner({ swept }: { swept: ProResult }) {
  const parts: string[] = [];
  if (swept.closed) parts.push(`${swept.closed} closed`);
  if (swept.swapped) parts.push(`${swept.swapped} swapped`);
  if (swept.burned) parts.push(`${swept.burned} burned`);
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 14px', borderRadius: '12px',
      background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)',
    }}>
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
        <path d="M2 7.5L5.5 11L12 3.5" stroke="#14F195" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#14F195' }}>Wallet cleaned ✓</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
          {parts.join(' · ')}{parts.length ? ' · ' : ''}
          <b style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{swept.sol.toFixed(4)} SOL</b> reclaimed
          {swept.skipped ? ` · ${swept.skipped} skipped` : ''}
        </div>
      </div>
    </div>
  );
}

/* ── kleine presentatie-componenten ── */
function Section({ title, sub, danger, action, children }: { title: string; sub: string; danger?: boolean; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', border: `1px solid ${danger ? 'rgba(255,80,100,0.25)' : 'rgba(255,255,255,0.1)'}`, background: danger ? 'rgba(255,60,80,0.04)' : 'rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: danger ? '#ff8b8b' : '#fff' }}>{title}</span>
        {action}
      </div>
      <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)' }}>{sub}</p>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        maxHeight: 'min(50vh, 280px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch', // iOS momentum-scroll
        overscrollBehavior: 'contain',    // scroll lekt niet naar de pagina
      }}>{children}</div>
    </div>
  );
}

// Klikbare rij: één expliciet klik-doel (div) i.p.v. label-geneste checkbox.
// Op iOS Safari vuurde de oude <label><input onChange> soms dubbel → selectie
// kwam als 0 binnen. De checkbox is nu presentationeel (readOnly, pointer-events
// uit) en de hele rij toggelt via één onClick. Toetsenbord via Enter/Spatie.
function ToggleRow({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      style={rowStyle}
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        style={{ pointerEvents: 'none', flexShrink: 0 }}
      />
      {children}
    </div>
  );
}

function Row({ h, checked, onToggle, right }: { h: TokenHolding; checked: boolean; onToggle: () => void; right?: string }) {
  return (
    <ToggleRow checked={checked} onToggle={onToggle}>
      {h.image ? <img src={h.image} alt="" width={20} height={20} style={{ borderRadius: '50%' }} /> : <span style={dot} />}
      <span style={{ flex: 1, fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name || shortMint(h.mint)}</span>
      {right && <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{right}</span>}
    </ToggleRow>
  );
}

// Burn-rij: checkbox staat standaard UIT (checked komt uit lege selectie-set)
function BurnRow({ h, checked, onToggle }: { h: TokenHolding; checked: boolean; onToggle: () => void }) {
  return (
    <ToggleRow checked={checked} onToggle={onToggle}>
      {h.image ? <img src={h.image} alt="" width={20} height={20} style={{ borderRadius: '4px' }} /> : <span style={dot} />}
      <span style={{ flex: 1, fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name || shortMint(h.mint)}</span>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{lamportsToSol(h.lamports).toFixed(4)} SOL</span>
    </ToggleRow>
  );
}

function KV({ label, value, dim, highlight }: { label: string; value?: string; dim?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
      <span style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      {value && <span style={{ fontSize: highlight ? '1.05rem' : '0.88rem', fontWeight: highlight ? 700 : 500, color: highlight ? '#14F195' : dim ? 'rgba(255,255,255,0.45)' : '#fff' }}>{value}</span>}
    </div>
  );
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '2px 0' };
const dot: React.CSSProperties = { width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', flexShrink: 0 };
const muted: React.CSSProperties = { margin: 0, fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' };
// Waarschuwings-tier (amber): duidelijk onderscheiden van muted-status én van de rode error.
const warn: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: '9px',
  margin: '16px 0 0', fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5,
  color: '#F5B740', background: 'rgba(245,183,64,0.12)',
  border: '1px solid rgba(245,183,64,0.32)', borderRadius: '10px', padding: '10px 13px',
};
const warnIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }}>
    <path d="M12 3 2 20h20L12 3z" stroke="#F5B740" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="#F5B740" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.9" fill="#F5B740" />
  </svg>
);
const primaryBtn: React.CSSProperties = { fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', background: '#14F195', color: '#05140d', border: 'none', borderRadius: '999px', padding: '11px 22px', cursor: 'pointer' };
const ghostBtn: React.CSSProperties = { fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '11px 22px', cursor: 'pointer' };
const smallBtn: React.CSSProperties = { fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '4px 10px', cursor: 'pointer' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,4,10,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' };
const modal: React.CSSProperties = { width: '100%', maxWidth: '400px', maxHeight: '85vh', overflowY: 'auto', background: 'linear-gradient(160deg, #160c2b 0%, #0c0718 100%)', border: '1px solid rgba(153,69,255,0.3)', borderRadius: '18px', padding: '24px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' };
