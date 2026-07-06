'use client';

import { useRef, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { PublicKey } from '@solana/web3.js';
import { getProxyConnection, scanClosable } from '@/lib/solanaProxy';
import { summarize, lamportsToSol } from '@/lib/funMode';

/**
 * Read-only wallet-preview: plak een Solana-adres → zie hoeveel SOL er te reclaimen
 * valt uit lege token-accounts, ZONDER wallet-connectie (publiek adres = geen signature).
 *
 * NIET achter isConnected gated. Scan draait ALLEEN op knopdruk (geen useEffect-op-render)
 * om credit-drain te voorkomen. Resultaten worden per adres gecachet (debounce + minder
 * RPC-calls). De scan loopt via getProxyConnection → /api/rpc, waar de rate-limit server-side
 * zit; een strengere limiet (Upstash-TODO) is dus later toe te voegen zonder dit component te
 * wijzigen — een 429 wordt hier al netjes afgevangen.
 */

type Status = 'idle' | 'scanning' | 'done' | 'error';
type Result = { emptyCount: number; grossSol: number; netSol: number };

export default function WalletPreview() {
  const { open } = useAppKit();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [focused, setFocused] = useState(false);

  const scanningRef = useRef(false);
  const cacheRef = useRef<Map<string, Result>>(new Map());

  async function handleCheck() {
    const raw = input.trim();
    if (!raw) {
      setStatus('error');
      setErrorMsg('Paste a Solana wallet address first.');
      return;
    }
    // Validatie: PublicKey gooit bij ongeldige base58/lengte.
    let owner: PublicKey;
    try {
      owner = new PublicKey(raw);
    } catch {
      setStatus('error');
      setErrorMsg("That doesn't look like a valid Solana address.");
      return;
    }

    if (scanningRef.current) return; // debounce: negeer klikken tijdens een lopende scan

    const key = owner.toBase58();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResult(cached);
      setStatus('done');
      return; // cache-hit → geen RPC-call
    }

    scanningRef.current = true;
    setStatus('scanning');
    setErrorMsg('');
    try {
      const conn = getProxyConnection();
      const found = await scanClosable(conn, owner);
      const sum = summarize(found);
      const res: Result = {
        emptyCount: sum.count,
        grossSol: lamportsToSol(sum.grossLamports),
        netSol: lamportsToSol(sum.netLamports),
      };
      cacheRef.current.set(key, res);
      setResult(res);
      setStatus('done');
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e);
      // 429 / rate limit (nu of straks via Upstash) → rustige, aparte melding.
      setErrorMsg(
        /429|rate.?limit/i.test(msg)
          ? 'Busy right now — try again in a few seconds.'
          : 'Could not scan that address (network). Try again.'
      );
      setStatus('error');
    } finally {
      scanningRef.current = false;
    }
  }

  const scanning = status === 'scanning';

  return (
    <div style={card}>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.25 }}>
        Check any wallet
      </div>
      <div style={{ fontSize: '0.74rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: '1px', marginBottom: '10px' }}>
        no connect needed
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '0.76rem', color: 'rgba(255,255,255,0.45)' }}>
        See how much SOL is locked in empty token accounts.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); handleCheck(); }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          aria-label="Solana wallet address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Paste a Solana address…"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          style={{
            flex: 1, minWidth: 0,
            fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem',
            color: '#fff',
            background: 'rgba(0,0,0,0.28)',
            border: `1px solid ${focused ? 'rgba(20,241,149,0.55)' : 'rgba(255,255,255,0.14)'}`,
            borderRadius: '10px', padding: '10px 12px', outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
        />
        <button
          type="submit"
          disabled={scanning}
          style={{
            flexShrink: 0,
            fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem',
            background: '#14F195', color: '#05140d',
            border: 'none', borderRadius: '10px', padding: '10px 18px',
            cursor: scanning ? 'wait' : 'pointer',
            opacity: scanning ? 0.6 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {scanning ? '…' : 'Check'}
        </button>
      </form>

      {status === 'error' && (
        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'rgba(255,150,150,0.85)' }}>{errorMsg}</p>
      )}

      {scanning && (
        <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Scanning on-chain…</p>
      )}

      {status === 'done' && result && (
        <div style={{ marginTop: '14px' }}>
          {result.emptyCount === 0 ? (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              This wallet is already clean — no empty token accounts.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14F195', lineHeight: 1 }}>
                  {result.grossSol.toFixed(4)}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>SOL</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>reclaimable</span>
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
                {result.emptyCount} empty token account{result.emptyCount === 1 ? '' : 's'} can be closed.
              </p>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
                ≈ {result.netSol.toFixed(4)} SOL you keep after the 10% fee.
              </p>

              <button
                onClick={() => open({ view: 'Connect' })}
                style={{
                  marginTop: '14px', width: '100%',
                  fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #14F195 0%, #9945FF 140%)',
                  color: '#05140d', border: 'none', borderRadius: '999px',
                  padding: '12px 20px', cursor: 'pointer',
                }}
              >
                Connect wallet to reclaim
              </button>
              <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Reclaims from your own wallet — connect the one you want to clean.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Zelfde card-look als WalletScan.tsx
const card: React.CSSProperties = {
  marginTop: '20px',
  maxWidth: '360px',
  background: 'linear-gradient(135deg, rgba(20,241,149,0.08) 0%, rgba(153,69,255,0.10) 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  padding: '18px 20px',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  fontFamily: 'General Sans, sans-serif',
};
