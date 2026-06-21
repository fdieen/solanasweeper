'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { PublicKey } from '@solana/web3.js';
import FunMode from './FunMode';
import { getProxyConnection, scanClosable } from '@/lib/solanaProxy';
import { summarize, lamportsToSol } from '@/lib/funMode';

type Status = 'idle' | 'scanning' | 'done' | 'error';

export default function WalletScan() {
  const { address, isConnected } = useAppKitAccount();
  const [status, setStatus] = useState<Status>('idle');
  const [emptyCount, setEmptyCount] = useState(0);
  const [reclaimSol, setReclaimSol] = useState(0);

  const scan = useCallback(async () => {
    if (!address) return;
    setStatus('scanning');
    try {
      // Eén consistent RPC-pad: Helius via onze /api/rpc proxy
      const conn = getProxyConnection();
      const owner = new PublicKey(address);
      const closable = await scanClosable(conn, owner);
      const sum = summarize(closable);
      setEmptyCount(sum.count);
      setReclaimSol(lamportsToSol(sum.grossLamports));
      setStatus('done');
    } catch (e) {
      console.error('Wallet scan failed', e);
      setStatus('error');
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) scan();
    else setStatus('idle');
  }, [isConnected, address, scan]);

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
          <button onClick={scan} style={retryBtn}>Retry</button>
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
          {emptyCount > 0 && <FunMode />}
        </>
      )}
    </div>
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
