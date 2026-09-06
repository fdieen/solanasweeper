'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  summarize,
  lamportsToSol,
  FEE_BPS,
  MIN_SOL_FOR_CLOSE,
  type ClosableAccount,
  type Summary,
} from '@/lib/funMode';
import { getProxyConnection, scanClosable, pollConfirm } from '@/lib/solanaProxy';
import { planSweep, humanizeSweepError, humanizeSimError, PreflightError } from '@/lib/sweep';
import { logSweepEvent, logSkipsByReason } from '@/lib/events';
import { resolveReferrer, recordReferralPayout, shortAddress } from '@/lib/referral';
import { splitFee } from '@/lib/fees';
import { formatSol } from '@/lib/pricing';
import { lowGasNotice } from '@/lib/messages';
import { track } from '@vercel/analytics';

type SolanaSigner = {
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
};

type Phase = 'idle' | 'preparing' | 'confirm' | 'working' | 'done' | 'error';

function parseFeeWallet(): PublicKey | null {
  const raw = process.env.NEXT_PUBLIC_FEE_WALLET;
  if (!raw) return null;
  try {
    return new PublicKey(raw);
  } catch {
    return null;
  }
}

export default function FunMode({
  initialAccounts,
  onSwept,
  onRescanned,
}: {
  initialAccounts?: ClosableAccount[];
  onSwept?: (r: { closed: number; netSol: number; skipped: number }) => void;
  /** Verse scanresultaten terug naar WalletScan, zodat de kaart hetzelfde toont als dit scherm. */
  onRescanned?: (accounts: ClosableAccount[]) => void;
}) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  const [phase, setPhase] = useState<Phase>('idle');
  const [accounts, setAccounts] = useState<ClosableAccount[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [result, setResult] = useState<{ closed: number; netSol: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState(''); // uitleg bij overgeslagen batches na een geslaagde sweep
  // Balance aan het adres gekoppeld: geen effect meer dat 'm synchroon op null zet bij een
  // wallet-wissel (extra renderronde), en het saldo van de vorige wallet kan nooit één
  // render lang de gas-check van de nieuwe sturen.
  const [balanceState, setBalance] = useState<{ addr: string; lamports: number } | null>(null);
  const [referrer, setReferrer] = useState<PublicKey | null>(null); // gevalideerde referrer of null

  // Balance proactief ophalen zodat de gas-blokkade al vóór het klikken zichtbaar is
  // (niet alleen in execute()). execute() houdt dezelfde check als vangnet.
  const balance = balanceState && balanceState.addr === address ? balanceState.lamports : null;

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    getProxyConnection().getBalance(new PublicKey(address))
      .then((b) => { if (!cancelled) setBalance({ addr: address, lamports: b }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [address]);

  const hasWork = (initialAccounts ?? []).length > 0; // FunMode mount alleen met werk, maar borg het toch
  const lowGas = balance != null && balance < MIN_SOL_FOR_CLOSE;
  const blockedByGas = hasWork && lowGas; // amber + disabled alléén als er iets te vegen valt

  if (!isConnected) return null;

  // Stap 1: bevestigingsscherm, altijd op een VERSE scan — net als Pro Mode, dat vlak
  // vóór het bouwen opnieuw scant. Het scanresultaat van WalletScan kan minuten oud zijn
  // (andere tab, andere sweep, een transfer in de tussentijd); dan klopt het bedrag in dit
  // scherm niet met wat er straks getekend wordt. Kost één RPC-ronde per klik op de knop,
  // niet per render. refreshBatch in de planner blijft het tweede vangnet vlak vóór tekenen.
  async function prepare() {
    if (!address) return;
    setPhase('preparing');
    setErrorMsg('');
    try {
      const conn = getProxyConnection();
      const owner = new PublicKey(address);
      let closable = await scanClosable(conn, owner);
      // Scan mislukt/leeg maar de kaart had wél werk → val terug op wat WalletScan gaf,
      // zodat een RPC-hik de knop niet doodslaat.
      if (closable.length === 0 && (initialAccounts ?? []).length > 0) {
        closable = initialAccounts ?? [];
      } else {
        onRescanned?.(closable); // kaart en dit scherm tonen nu hetzelfde
      }
      if (closable.length === 0) {
        setErrorMsg('No empty accounts to close right now.');
        setPhase('error');
        return;
      }
      setAccounts(closable);
      setSummary(summarize(closable));
      // Referrer resolven voor de fee-split + confirm-weergave (binding > localStorage,
      // niet self, account bestaat). Faalt dit → null (100% naar de fee-wallet).
      try {
        setReferrer(await resolveReferrer(getProxyConnection(), new PublicKey(address)));
      } catch { setReferrer(null); }
      setPhase('confirm');
    } catch (e) {
      console.error(e);
      logSweepEvent({
        wallet: address, mode: 'fun', phase: 'scan', outcome: 'error',
        errorCode: 'scan_failed', message: humanizeSweepError(e),
      });
      setErrorMsg('Could not read your wallet (RPC). Try again.');
      setPhase('error');
    }
  }

  // Stap 2: bouwen → tekenen → simuleren → versturen → pollen
  async function execute() {
    if (!address) return;
    setPhase('working');
    setErrorMsg('');
    setNotice('');
    try {
      const conn = getProxyConnection();
      const owner = new PublicKey(address);

      // Gas-poort: te weinig SOL → de fee-payer kan de tx niet laten simuleren,
      // wat in Phantom een rode warning geeft. Vang dat hier rustig af i.p.v.
      // de wallet te openen. Stuurt NIETS naar Phantom als de balance te laag is.
      const bal = await conn.getBalance(owner);
      setBalance({ addr: address, lamports: bal });
      if (bal < MIN_SOL_FOR_CLOSE) { setPhase('idle'); return; }

      // Plannen: verse scan → chunken → per batch herbevestigen → preflight met
      // split-retry. Alles vóór het tekenen, zodat één signAllTransactions volstaat.
      const { blockhash } = await conn.getLatestBlockhash('confirmed');
      const feeWallet = parseFeeWallet();
      const { transactions, batches, skipped: planSkipped, errors: planErrors } = await planSweep({
        connection: conn, owner, feeWallet, blockhash, referrer,
      });

      // Wat de planner afwees, per reden geteld (al gesloten, niet leeg, frozen, preflight).
      logSkipsByReason(
        { wallet: address, mode: 'fun', phase: 'preflight' },
        planSkipped.map((sk) => sk.reason),
      );
      for (const message of planErrors) {
        logSweepEvent({ wallet: address, mode: 'fun', phase: 'preflight', outcome: 'error', errorCode: 'batch_preflight_failed', message });
      }

      if (transactions.length === 0) {
        // Niets over: of alles was al gesloten, of preflight wees alles af.
        setErrorMsg(planErrors[0] ?? 'Accounts already closed.');
        setPhase('error');
        return;
      }

      // Tekenen (1 approval indien mogelijk, anders per tx)
      const signer = walletProvider as SolanaSigner;
      let signed: Transaction[];
      if (signer.signAllTransactions) {
        signed = await signer.signAllTransactions(transactions);
      } else if (signer.signTransaction) {
        signed = [];
        for (const tx of transactions) signed.push(await signer.signTransaction(tx));
      } else {
        throw new Error('Wallet cannot sign transactions');
      }
      track('sweep_signed', { mode: 'fun', transactions: signed.length });

      // Per batch: simuleren → versturen → bevestigen (geïsoleerd, atomair)
      let closed = 0;
      let reclaimed = 0;
      // Accounts die de planner al afwees (al gesloten, niet leeg, frozen, preflight)
      // tellen mee in de skipped-melding, naast batches die alsnog on-chain falen.
      let skipped = planSkipped.length;
      for (let i = 0; i < signed.length; i++) {
        const stx = signed[i];
        const planned = batches[i].length;
        try {
          const sim = await conn.simulateTransaction(stx);
          if (sim.value.err) {
            skipped += planned;
            logSweepEvent({
              wallet: address, mode: 'fun', phase: 'send', outcome: 'error',
              errorCode: 'simulation_failed', message: humanizeSimError(sim.value.err, sim.value.logs ?? []),
              accountsPlanned: planned, accountsDone: 0,
            });
            continue;
          }
          const sig = await conn.sendRawTransaction(stx.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
          });
          const ok = await pollConfirm(conn, sig);
          if (ok) {
            logSweepEvent({
              wallet: address, mode: 'fun', phase: 'confirm', outcome: 'ok',
              signature: sig, accountsPlanned: planned, accountsDone: planned,
            });
            closed += planned;
            const batchGross = batches[i].reduce((s, a) => s + a.rentLamports, 0);
            reclaimed += batchGross;
            // Referral-payout registreren (fire-and-forget) voor deze bevestigde batch.
            if (referrer && feeWallet) {
              const batchFee = Math.floor((batchGross * FEE_BPS) / 10_000);
              const { referrerLamports } = splitFee(batchFee, referrer);
              // Alleen de signature melden; de server verifieert + leidt de rest af.
              if (referrerLamports > 0) recordReferralPayout(sig);
            }
          } else {
            skipped += planned;
            logSweepEvent({
              wallet: address, mode: 'fun', phase: 'confirm', outcome: 'error',
              errorCode: 'not_confirmed', signature: sig,
              message: 'Not confirmed in time', accountsPlanned: planned, accountsDone: 0,
            });
          }
        } catch (e) {
          console.error('Batch failed', e);
          skipped += planned;
          logSweepEvent({
            wallet: address, mode: 'fun', phase: 'send', outcome: 'error',
            errorCode: 'send_failed', message: humanizeSweepError(e),
            accountsPlanned: planned, accountsDone: 0,
          });
        }
      }

      const netLamports = reclaimed - Math.floor((reclaimed * FEE_BPS) / 10_000);
      const sweptResult = { closed, netSol: lamportsToSol(netLamports), skipped };
      setResult(sweptResult);
      // Preflight-reden meegeven zodat "3 skipped" niet zonder uitleg blijft staan.
      setNotice(planErrors[0] ?? '');
      setPhase('done');

      // Pas NA on-chain bevestiging (de pollConfirm hierboven is al gelopen): laat
      // WalletScan de reclaimable-kaart naar 0 verversen én seinsein de read-only
      // "Check any wallet"-preview zodat die hetzelfde adres opnieuw scant.
      if (closed > 0) {
        track('sweep_confirmed', {
          mode: 'fun',
          closed,
          reclaimed_sol: Number(lamportsToSol(netLamports).toFixed(4)),
          skipped,
        });
        onSwept?.(sweptResult);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sweep-confirmed', { detail: { address } }));
        }
      }
    } catch (e) {
      console.error(e);
      // Eén bron van waarheid voor de tekst (preflight, cancel, RPC-storing).
      const message = humanizeSweepError(e);
      logSweepEvent({
        wallet: address, mode: 'fun',
        phase: e instanceof PreflightError ? 'preflight' : 'sign',
        outcome: 'error',
        errorCode: e instanceof PreflightError ? e.code : 'sweep_failed',
        message,
      });
      setErrorMsg(message);
      setPhase('error');
    }
  }

  return (
    <div style={{ marginTop: '14px' }}>
      {/* Gas-blokkade: eigen amber waarschuwings-tier, boven de knop, disablet 'm */}
      {blockedByGas && (
        <div style={warn}>
          {warnIcon}
          <span>{lowGasNotice(MIN_SOL_FOR_CLOSE)}</span>
        </div>
      )}
      {(phase === 'idle' || phase === 'error' || phase === 'done') && (
        <button onClick={prepare} disabled={blockedByGas} style={{ ...primaryBtn, opacity: blockedByGas ? 0.4 : 1, cursor: blockedByGas ? 'not-allowed' : 'pointer' }}>
          Reclaim my SOL
        </button>
      )}
      {phase === 'preparing' && <p style={muted}>Checking your accounts…</p>}
      {phase === 'working' && <p style={muted}>Closing accounts — approve in your wallet…</p>}

      {phase === 'error' && errorMsg && (
        <p style={{ ...muted, marginTop: '8px', color: 'rgba(255,140,140,0.8)' }}>{errorMsg}</p>
      )}

      {phase === 'done' && result && (
        <>
          <p style={{ ...muted, marginTop: '8px', color: '#14F195' }}>
            Closed {result.closed} account{result.closed === 1 ? '' : 's'} · {result.netSol.toFixed(4)} SOL reclaimed
            {result.skipped > 0 ? ` · ${result.skipped} skipped` : ''}
          </p>
          {result.skipped > 0 && notice && (
            <p style={{ ...muted, marginTop: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              {notice}
            </p>
          )}
        </>
      )}

      {/* Pre-sign bevestigingsscherm — via portal naar <body>. De WalletScan-kaart eromheen
          heeft backdrop-filter, wat 'm tot containing-block voor position:fixed maakt; zonder
          portal wordt de overlay ingeklemd in de kaart i.p.v. de viewport (mobiel-bug). */}
      {phase === 'confirm' && summary && typeof document !== 'undefined' && createPortal(
        <div style={overlay} onClick={() => setPhase('idle')}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
              Confirm cleanup
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              You’ll sign in your wallet. Nothing is destroyed — only empty accounts are closed.
            </p>

            <Row label={`Closing ${summary.count} empty account${summary.count === 1 ? '' : 's'}`} />
            <Row label="Gross reclaim" value={`${lamportsToSol(summary.grossLamports).toFixed(4)} SOL`} />
            <Row label={`Fee (${FEE_BPS / 100}%)`} value={`− ${lamportsToSol(summary.feeLamports).toFixed(4)} SOL`} dim />
            {referrer && splitFee(summary.feeLamports, referrer).referrerLamports > 0 && (
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'rgba(20,241,149,0.85)', lineHeight: 1.4 }}>
                Referral active — 25% of the fee ({formatSol(lamportsToSol(splitFee(summary.feeLamports, referrer).referrerLamports))} SOL)
                {' '}goes to your referrer {shortAddress(referrer.toBase58())}, paid in this transaction.
              </p>
            )}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
            <Row label="You receive" value={`${lamportsToSol(summary.netLamports).toFixed(4)} SOL`} highlight />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setPhase('idle')} style={ghostBtn}>Cancel</button>
              <button onClick={execute} style={{ ...primaryBtn, flex: 1 }}>Sign & reclaim</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Row({ label, value, dim, highlight }: { label: string; value?: string; dim?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      {value && (
        <span style={{
          fontSize: highlight ? '1.1rem' : '0.9rem',
          fontWeight: highlight ? 700 : 500,
          color: highlight ? '#14F195' : dim ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
  background: '#14F195', color: '#05140d', border: 'none', borderRadius: '999px',
  padding: '11px 22px', cursor: 'pointer',
};
const ghostBtn: React.CSSProperties = {
  fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
  background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '999px', padding: '11px 22px', cursor: 'pointer',
};
const muted: React.CSSProperties = {
  margin: 0, fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)',
};
// Waarschuwings-tier (amber): duidelijk onderscheiden van muted-status én van de rode error.
const warn: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: '9px',
  margin: '0 0 12px', fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.5,
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
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,4,10,0.7)',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  overflowY: 'auto',
};
const modal: React.CSSProperties = {
  width: '100%', maxWidth: '380px',
  background: 'linear-gradient(160deg, #160c2b 0%, #0c0718 100%)',
  border: '1px solid rgba(153,69,255,0.3)', borderRadius: '18px', padding: '24px',
  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
};
