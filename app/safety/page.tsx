import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';

export const metadata: Metadata = {
  title: 'Safety — SolSweep',
  description: 'Non-custodial. You sign every transaction. Your keys never leave your wallet.',
};

const doList = [
  'Read your token accounts (read-only scan)',
  'Show you what can be closed or swapped',
  'Build and present transactions for your review',
  'Deduct a 5% fee from what you reclaim',
];

const dontList = [
  'Hold your private keys — ever',
  'Submit transactions without your signature',
  'Move funds without your explicit approval',
  'Claim to be audited (it\'s on the roadmap — not yet true)',
];

const trustItems = [
  {
    label: 'Non-custodial',
    color: '#14F195',
    body: 'SolSweep never holds your funds or keys. Every action is a transaction you sign in your own wallet. We build the instruction; you approve it in Phantom, Solflare, or Backpack.',
  },
  {
    label: 'You sign everything',
    color: '#9945FF',
    body: 'No transaction is submitted without your explicit signature. You can inspect the transaction in your wallet before approving. On Solana, all transactions are public on-chain — nothing is hidden.',
  },
  {
    label: 'Powered by Jupiter',
    color: '#14F195',
    body: 'Token → SOL swaps use Jupiter, Solana\'s largest DEX aggregator. We don\'t run our own liquidity pools or market-make against you.',
  },
  {
    label: 'Burns are permanent',
    color: '#9945FF',
    body: 'In Pro Mode, burning tokens is irreversible. We make this unmissable before you sign. Fun Mode (closing empty accounts) is the safe default — no tokens are destroyed.',
  },
];

export default function Safety() {
  return (
    <InnerLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          Security & trust
        </p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
          lineHeight: 1.05, color: '#fff', marginBottom: '24px',
        }}>
          Your keys.<br />Your SOL.
        </h1>
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '1rem', lineHeight: 1.7,
          color: 'rgba(255,255,255,0.45)', maxWidth: '480px', marginBottom: '64px',
        }}>
          SolSweep is non-custodial. We never touch your keys, and no transaction moves without your signature.
        </p>

        {/* Trust grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', marginBottom: '64px' }}>
          {trustItems.map(({ label, color, body }) => (
            <div key={label} style={{ background: '#07070f', padding: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                marginBottom: '14px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'General Sans, sans-serif', fontWeight: 600,
                  fontSize: '0.9rem', color: '#fff',
                }}>
                  {label}
                </span>
              </div>
              <p style={{
                fontFamily: 'General Sans, sans-serif', fontWeight: 400,
                fontSize: '0.88rem', lineHeight: 1.7,
                color: 'rgba(255,255,255,0.42)',
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Do / Don't */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '64px' }}>
          <div>
            <p style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 600,
              fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#14F195', marginBottom: '20px',
            }}>
              What we do
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doList.map(item => (
                <li key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ flexShrink: 0, marginTop: '3px' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#14F195" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 600,
              fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', marginBottom: '20px',
            }}>
              What we don&apos;t
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dontList.map(item => (
                <li key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ flexShrink: 0, marginTop: '3px' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3L11 11M11 3L3 11" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.35)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Audit note */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '24px 28px',
        }}>
          <p style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 400,
            fontSize: '0.88rem', lineHeight: 1.7,
            color: 'rgba(255,255,255,0.4)',
          }}>
            <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Security audit</strong> — A full audit is planned and on the roadmap. We will not claim &ldquo;audited&rdquo; until it is done. That is a deliberate choice — false trust signals are worse than none.
          </p>
        </div>
      </div>
    </InnerLayout>
  );
}
