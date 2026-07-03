'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  buildBatches,
  summarize,
  lamportsToSol,
  FEE_BPS,
  MIN_SOL_FOR_GAS,
  type ClosableAccount,
  type Summary,
} from '@/lib/funMode';
import { getProxyConnection, scanClosable, pollConfirm } from '@/lib/solanaProxy';

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

export default function FunMode({ initialAccounts }: { initialAccounts?: ClosableAccount[] }) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  const [phase, setPhase] = useState<Phase>('idle');
  const [accounts, setAccounts] = useState<ClosableAccount[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [result, setResult] = useState<{ closed: number; netSol: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState(''); // rustige melding (bv. te weinig gas), geen error

  if (!isConnected) return null;

  // Stap 1: bevestigingsscherm. Hergebruik het scan-resultaat van WalletScan
  // (initialAccounts) i.p.v. opnieuw te scannen — bespaart een dure RPC-ronde.
  // De échte verse her-verificatie gebeurt in execute() vlak vóór tekenen.
  async function prepare() {
    if (!address) return;
    setPhase('preparing');
    setErrorMsg('');
    setNoticeMsg('');
    try {
      let closable = initialAccounts ?? [];
      if (closable.length === 0) {
        // Geen doorgegeven resultaat (of leeg) → zelf scannen als fallback.
        const conn = getProxyConnection();
        const owner = new PublicKey(address);
        closable = await scanClosable(conn, owner);
      }
      if (closable.length === 0) {
        setErrorMsg('No empty accounts to close right now.');
        setPhase('error');
        return;
      }
      setAccounts(closable);
      setSummary(summarize(closable));
      setPhase('confirm');
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not read your wallet (RPC). Try again.');
      setPhase('error');
    }
  }

  // Stap 2: bouwen → tekenen → simuleren → versturen → pollen
  async function execute() {
    if (!address) return;
    setPhase('working');
    setErrorMsg('');
    setNoticeMsg('');
    try {
      const conn = getProxyConnection();
      const owner = new PublicKey(address);

      // Gas-poort: te weinig SOL → de fee-payer kan de tx niet laten simuleren,
      // wat in Phantom een rode warning geeft. Vang dat hier rustig af i.p.v.
      // de wallet te openen. Stuurt NIETS naar Phantom als de balance te laag is.
      const balance = await conn.getBalance(owner);
      if (balance < MIN_SOL_FOR_GAS) {
        setNoticeMsg('Je wallet heeft een klein beetje SOL nodig voor netwerkkosten (±0,01 SOL). Stuur wat SOL naar je wallet en probeer het opnieuw.');
        setPhase('idle');
        return;
      }

      // Verse herverificatie net vóór tekenen
      const fresh = await scanClosable(conn, owner);
      if (fresh.length === 0) {
        setErrorMsg('Accounts already closed.');
        setPhase('error');
        return;
      }

      const { blockhash } = await conn.getLatestBlockhash('confirmed');
      const feeWallet = parseFeeWallet();
      const { transactions, batches } = buildBatches({ owner, accounts: fresh, feeWallet, blockhash });

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

      // Per batch: simuleren → versturen → bevestigen (geïsoleerd, atomair)
      let closed = 0;
      let reclaimed = 0;
      let skipped = 0;
      for (let i = 0; i < signed.length; i++) {
        const stx = signed[i];
        try {
          const sim = await conn.simulateTransaction(stx);
          if (sim.value.err) {
            skipped += batches[i].length;
            continue;
          }
          const sig = await conn.sendRawTransaction(stx.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
          });
          const ok = await pollConfirm(conn, sig);
          if (ok) {
            closed += batches[i].length;
            reclaimed += batches[i].reduce((s, a) => s + a.lamports, 0);
          } else {
            skipped += batches[i].length;
          }
        } catch (e) {
          console.error('Batch failed', e);
          skipped += batches[i].length;
        }
      }

      const netLamports = reclaimed - Math.floor((reclaimed * FEE_BPS) / 10_000);
      setResult({ closed, netSol: lamportsToSol(netLamports), skipped });
      setPhase('done');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error && /reject|denied|user/i.test(e.message)
        ? 'You cancelled the signature.'
        : 'Something went wrong. No funds moved unless a transaction confirmed.';
      setErrorMsg(msg);
      setPhase('error');
    }
  }

  return (
    <div style={{ marginTop: '14px' }}>
      {(phase === 'idle' || phase === 'error' || phase === 'done') && (
        <button onClick={prepare} style={primaryBtn}>
          Reclaim my SOL
        </button>
      )}
      {phase === 'preparing' && <p style={muted}>Checking your accounts…</p>}
      {phase === 'working' && <p style={muted}>Closing accounts — approve in your wallet…</p>}

      {phase === 'error' && errorMsg && (
        <p style={{ ...muted, marginTop: '8px', color: 'rgba(255,140,140,0.8)' }}>{errorMsg}</p>
      )}

      {/* Rustige gas-melding (geen error-stijl) */}
      {noticeMsg && (
        <p style={{ ...muted, marginTop: '8px' }}>{noticeMsg}</p>
      )}

      {phase === 'done' && result && (
        <p style={{ ...muted, marginTop: '8px', color: '#14F195' }}>
          Closed {result.closed} account{result.closed === 1 ? '' : 's'} · {result.netSol.toFixed(4)} SOL reclaimed
          {result.skipped > 0 ? ` · ${result.skipped} skipped` : ''}
        </p>
      )}

      {/* Pre-sign bevestigingsscherm */}
      {phase === 'confirm' && summary && (
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
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
            <Row label="You receive" value={`${lamportsToSol(summary.netLamports).toFixed(4)} SOL`} highlight />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setPhase('idle')} style={ghostBtn}>Cancel</button>
              <button onClick={execute} style={{ ...primaryBtn, flex: 1 }}>Sign & reclaim</button>
            </div>
          </div>
        </div>
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
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,4,10,0.7)',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
};
const modal: React.CSSProperties = {
  width: '100%', maxWidth: '380px',
  background: 'linear-gradient(160deg, #160c2b 0%, #0c0718 100%)',
  border: '1px solid rgba(153,69,255,0.3)', borderRadius: '18px', padding: '24px',
  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
};
