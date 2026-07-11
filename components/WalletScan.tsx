'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { PublicKey } from '@solana/web3.js';
import FunMode from './FunMode';
import ProMode from './ProMode';
import { getProxyConnection, scanClosable } from '@/lib/solanaProxy';
import { summarize, lamportsToSol, type ClosableAccount } from '@/lib/funMode';

type Status = 'idle' | 'scanning' | 'done' | 'error';
type Mode = 'fun' | 'pro';
type SweptResult = { closed: number; netSol: number; skipped: number };

export default function WalletScan() {
  const { address, isConnected } = useAppKitAccount();
  const [mode, setMode] = useState<Mode>('fun');
  const [status, setStatus] = useState<Status>('idle');
  const [emptyCount, setEmptyCount] = useState(0);
  const [reclaimSol, setReclaimSol] = useState(0);
  const [closable, setClosable] = useState<ClosableAccount[]>([]);
  // Wat er zojuist is teruggewonnen (na bevestigde close-tx). Zolang gezet: toon de
  // "Wallet is clean ✓"-success i.p.v. de oude reclaimable + CTA.
  const [swept, setSwept] = useState<SweptResult | null>(null);

  // Onthoudt voor welk adres we al gescand hebben, zodat een reconnect/re-render
  // (Reown pingt de sessie → re-render) NIET opnieuw scant. Dít was de credit-drain.
  const scannedFor = useRef<string | null>(null);

  const scan = useCallback(async () => {
    if (!address) return;
    setStatus('scanning');
    try {
      // Eén consistent RPC-pad: Helius via onze /api/rpc proxy
      const conn = getProxyConnection();
      const owner = new PublicKey(address);
      const found = await scanClosable(conn, owner);
      const sum = summarize(found);
      setClosable(found);
      setEmptyCount(sum.count);
      setReclaimSol(lamportsToSol(sum.grossLamports));
      setStatus('done');
    } catch (e) {
      console.error('Wallet scan failed', e);
      setStatus('error');
    }
  }, [address]);

  // Handmatige (re)scan vanuit de UI: bypass de guard zodat een Retry/Rescan altijd werkt.
  const rescan = useCallback(() => {
    if (address) scannedFor.current = address;
    scan();
  }, [address, scan]);

  useEffect(() => {
    if (!isConnected || !address) return;
    // Al gescand voor dit adres → niets doen. We resetten de ref bewust NIET op
    // disconnect: zo scant een reconnect-flikker (isConnected false→true, zelfde
    // wallet) niet opnieuw. Dít was de credit-drain. Handmatig verversen = rescan().
    if (scannedFor.current === address) return;
    scannedFor.current = address;
    scan();
  }, [isConnected, address, scan]);

  // Ander wallet-adres → een eventuele "just swept"-success is niet meer relevant.
  useEffect(() => { setSwept(null); }, [address]);

  // Na een bevestigde sweep: herbevestig de on-chain state met een verse scan. Blijkt er
  // (door skips) toch nog iets closable, dan valt de success weg en toont de kaart de rest.
  useEffect(() => {
    if (swept && status === 'done' && emptyCount > 0) setSwept(null);
  }, [swept, status, emptyCount]);

  // Aangeroepen door FunMode NA on-chain bevestiging (niet na versturen).
  const onSwept = useCallback((r: SweptResult) => {
    setSwept(r);
    rescan(); // verse RPC-state ophalen zodat reclaimable/telling naar 0 gaan
  }, [rescan]);

  if (!isConnected) return null;

  const card: React.CSSProperties = {
    marginTop: '24px',
    maxWidth: '360px',
    background: 'linear-gradient(135deg, rgba(20,241,149,0.08) 0%, rgba(153,69,255,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    padding: '18px 20px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    fontFamily: 'General Sans, sans-serif',
  };

  return (
    <div style={card}>
      {/* Fun / Pro toggle */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', borderRadius: '999px', padding: '3px', marginBottom: '16px', width: 'fit-content' }}>
        {(['fun', 'pro'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.78rem',
              border: 'none', borderRadius: '999px', padding: '6px 16px', cursor: 'pointer',
              background: mode === m ? '#14F195' : 'transparent',
              color: mode === m ? '#05140d' : 'rgba(255,255,255,0.6)',
            }}
          >
            {m === 'fun' ? 'Fun Mode' : 'Pro Mode'}
          </button>
        ))}
      </div>

      {mode === 'pro' ? (
        <ProMode />
      ) : (
        <FunModeView
          status={status}
          emptyCount={emptyCount}
          reclaimSol={reclaimSol}
          closable={closable}
          rescan={rescan}
          swept={swept}
          onSwept={onSwept}
        />
      )}
    </div>
  );
}

function FunModeView({
  status, emptyCount, reclaimSol, closable, rescan, swept, onSwept,
}: {
  status: Status; emptyCount: number; reclaimSol: number; closable: ClosableAccount[];
  rescan: () => void; swept: SweptResult | null; onSwept: (r: SweptResult) => void;
}) {
  // Na een geslaagde sweep: toon de clean-success (reclaimable 0.0000, telling 0),
  // de CTA is vervangen door "Wallet is clean ✓" met wat er zojuist is teruggewonnen.
  if (swept) return <CleanSuccess swept={swept} />;

  return (
    <>
      {(status === 'scanning' || status === 'idle') && (
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          Scanning your wallet…
        </p>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
            Scan failed (RPC limit). Try again.
          </p>
          <button onClick={rescan} style={retryBtn}>Retry</button>
        </div>
      )}

      {status === 'done' && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14F195', lineHeight: 1 }}>
              {reclaimSol.toFixed(4)}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>SOL</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>reclaimable</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
            {emptyCount === 0
              ? 'No empty token accounts found — your wallet is clean!'
              : `${emptyCount} empty token account${emptyCount === 1 ? '' : 's'} can be closed.`}
          </p>
          {emptyCount > 0 && <FunMode initialAccounts={closable} onSwept={onSwept} />}
        </>
      )}
    </>
  );
}

// Success-state na een bevestigde sweep.
function CleanSuccess({ swept }: { swept: SweptResult }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14F195', lineHeight: 1 }}>0.0000</span>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>SOL</span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>reclaimable</span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
        0 empty token accounts left.
      </p>

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 14px', borderRadius: '12px',
        background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)',
      }}>
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
          <path d="M2 7.5L5.5 11L12 3.5" stroke="#14F195" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#14F195' }}>Wallet is clean ✓</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            Just reclaimed <b style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{swept.netSol.toFixed(4)} SOL</b>
            {' '}from {swept.closed} account{swept.closed === 1 ? '' : 's'}
            {swept.skipped > 0 ? ` · ${swept.skipped} skipped` : ''}.
          </div>
        </div>
      </div>
    </>
  );
}

const retryBtn: React.CSSProperties = {
  fontFamily: 'General Sans, sans-serif',
  fontWeight: 600,
  fontSize: '0.78rem',
  background: '#fff',
  color: '#05050a',
  border: 'none',
  borderRadius: '999px',
  padding: '6px 14px',
  cursor: 'pointer',
  flexShrink: 0,
};
