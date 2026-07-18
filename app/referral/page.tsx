'use client';

import { useState } from 'react';
import InnerLayout from '@/components/InnerLayout';
import { isValidSolAddress } from '@/lib/referral';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://solanasweeper.com';

type Payout = { tx: string; lamports: number; referred: string; at: string };
type Stats = { sweeps: number; totalLamports: number; payouts: Payout[] };

const sol = (l: number) => (l / 1_000_000_000).toFixed(4);
const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

const PERKS = [
  ['25% of platform fees', 'You earn a quarter of the 10% fee on every sweep your referrals make.'],
  ['Lifetime', 'No expiry per referral. Last click wins, then locked in on their first sweep.'],
  ['Paid instantly', 'Your share is transferred in the same sweep transaction — no claiming, no waiting.'],
  ['Verifiable on-chain', 'Every payout is a real transfer to your wallet. Check it on Solscan.'],
];

export default function ReferralPage() {
  const [wallet, setWallet] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const trimmed = wallet.trim();
  const valid = isValidSolAddress(trimmed);
  const link = valid ? `${SITE}/?ref=${trimmed}` : '';

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard geblokkeerd */ }
  }

  async function loadStats() {
    if (!valid) { setErr('Enter a valid Solana address first.'); return; }
    setErr('');
    setLoading(true);
    setStats(null);
    try {
      const res = await fetch(`/api/referral/stats?wallet=${trimmed}`, { cache: 'no-store' });
      const data = (await res.json()) as Stats;
      setStats(data);
    } catch {
      setErr('Could not load stats right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 72% 48% at 50% 0%, rgba(50,26,95,0.24) 0%, transparent 62%),
      radial-gradient(ellipse 46% 34% at 10% 6%, rgba(153,69,255,0.16) 0%, transparent 55%),
      radial-gradient(ellipse 44% 30% at 92% 10%, rgba(20,241,149,0.10) 0%, transparent 55%)
    `}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 40px) 80px', fontFamily: 'General Sans, sans-serif' }}>

        <p style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#14F195', margin: '0 0 18px' }}>
          Referral program
        </p>
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)', letterSpacing: '-0.03em', lineHeight: 1.08, color: '#fff', margin: '0 0 18px' }}>
          Earn <span style={{ background: 'linear-gradient(100deg, #14F195, #9945FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>25%</span> of every sweep
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '0 0 40px', maxWidth: '560px' }}>
          Share your link. When someone cleans their wallet through it, 25% of the platform fee is
          paid straight to you — in the same transaction, on-chain, forever.
        </p>

        {/* Perks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '44px' }}>
          {PERKS.map(([title, body]) => (
            <div key={title} style={{ padding: '18px 20px', borderRadius: '14px', background: 'linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.98rem', color: '#fff', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.5)' }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Link generator */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>Your referral link</h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px' }}>
          Paste your Solana wallet address. No connection needed — this is the wallet that gets paid.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Your Solana address…"
            spellCheck={false} autoCapitalize="none" autoCorrect="off"
            className="wp-addr"
            style={{
              flex: 1, minWidth: '220px', fontFamily: 'General Sans, sans-serif', fontSize: '0.9rem', color: '#fff',
              background: 'rgba(0,0,0,0.3)', border: `1px solid ${valid ? 'rgba(20,241,149,0.5)' : 'rgba(255,255,255,0.14)'}`,
              borderRadius: '12px', padding: '12px 14px', outline: 'none',
            }}
          />
          <button
            onClick={copy}
            disabled={!valid}
            style={{
              flexShrink: 0, fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              background: valid ? 'linear-gradient(135deg, #14F195 0%, #9945FF 150%)' : 'rgba(255,255,255,0.08)',
              color: valid ? '#05140d' : 'rgba(255,255,255,0.4)', border: 'none', borderRadius: '12px',
              padding: '12px 22px', cursor: valid ? 'pointer' : 'not-allowed',
            }}
          >
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>
        {valid && (
          <p style={{ fontSize: '0.82rem', color: 'rgba(20,241,149,0.8)', margin: '12px 0 0', wordBreak: 'break-all', fontFamily: 'ui-monospace, Menlo, monospace' }}>
            {link}
          </p>
        )}

        {/* Stats */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: '48px 0 12px' }}>Your earnings</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={loadStats}
            disabled={!valid || loading}
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.88rem',
              background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '999px', padding: '9px 18px', cursor: valid && !loading ? 'pointer' : 'not-allowed',
              opacity: valid && !loading ? 1 : 0.5,
            }}
          >
            {loading ? 'Loading…' : 'Check earnings'}
          </button>
        </div>
        {err && <p style={{ fontSize: '0.85rem', color: 'rgba(255,150,150,0.85)', margin: '0 0 12px' }}>{err}</p>}

        {stats && (
          <div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '160px', padding: '18px 20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(20,241,149,0.08), rgba(153,69,255,0.08))', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14F195', lineHeight: 1 }}>{sol(stats.totalLamports)}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px' }}>SOL earned</div>
              </div>
              <div style={{ flex: 1, minWidth: '160px', padding: '18px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stats.sweeps}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px' }}>Referred sweeps</div>
              </div>
            </div>

            {stats.payouts.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>
                No payouts yet. Share your link to get started.
              </p>
            ) : (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
                  Recent payouts
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.payouts.map((p) => (
                    <a
                      key={p.tx}
                      href={`https://solscan.io/tx/${p.tx}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '13px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                        from {short(p.referred)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#14F195' }}>+{sol(p.lamports)} SOL</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Solscan ↗</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InnerLayout>
  );
}
