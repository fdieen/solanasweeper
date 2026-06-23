import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import KeyClient from '@/components/KeyClient';

export const metadata: Metadata = {
  title: 'Safety',
  description: 'Non-custodial. You sign every transaction. Your keys never leave your wallet. Swaps powered by Jupiter.',
  alternates: { canonical: '/safety' },
};

const doList = [
  'Read your token accounts (read-only scan)',
  'Show you what can be closed or swapped',
  'Build and present transactions for your review',
  'Deduct a 10% fee from what you reclaim',
];

const dontList = [
  'Hold your private keys, ever',
  'Submit transactions without your signature',
  'Move funds without your explicit approval',
  'Claim to be audited (it\'s on the roadmap, not yet true)',
];

const trustItems = [
  {
    label: 'Non-custodial',
    color: '#14F195',
    body: 'SolanaSweeper never holds your funds or keys. Every action is a transaction you sign in your own wallet. We build the instruction; you approve it in Phantom, Solflare, or Backpack.',
  },
  {
    label: 'You sign everything',
    color: '#9945FF',
    body: 'No transaction is submitted without your explicit signature. You can inspect the transaction in your wallet before approving. On Solana, all transactions are public on-chain. Nothing is hidden.',
  },
  {
    label: 'Powered by Jupiter',
    color: '#14F195',
    body: 'Token to SOL swaps use Jupiter, Solana\'s largest DEX aggregator. We don\'t run our own liquidity pools or market-make against you.',
  },
  {
    label: 'Burns are permanent',
    color: '#9945FF',
    body: 'In Pro Mode, burning tokens is irreversible. We make this unmissable before you sign. Fun Mode (closing empty accounts) is the safe default. No tokens are destroyed.',
  },
];

export default function Safety() {
  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 90% 70% at 50% 35%, rgba(40,30,90,0.30) 0%, transparent 70%),
      radial-gradient(ellipse 65% 50% at 90% 12%, rgba(20,241,149,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 10% 10%, rgba(153,69,255,0.24) 0%, transparent 55%),
      radial-gradient(ellipse 65% 50% at 85% 95%, rgba(20,241,149,0.16) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 15% 100%, rgba(153,69,255,0.20) 0%, transparent 55%),
      linear-gradient(180deg, rgba(30,20,60,0.22) 0%, rgba(12,10,26,0.10) 50%, rgba(20,40,40,0.18) 100%)
    `}>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          Security & trust
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 3vw, 40px)', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
            lineHeight: 1.05, color: '#fff', margin: 0,
          }}>
            Your keys.<br />Your SOL.
          </h1>
          <div style={{
            position: 'relative',
            zIndex: 3,
            width: 'clamp(110px, 16vw, 180px)',
            height: 'clamp(110px, 16vw, 180px)',
            flexShrink: 0,
          }}>
            {/* Zachte glow achter de sleutel zodat de donkere randen niet wegvallen */}
            <div style={{
              position: 'absolute', inset: '-10%',
              background: 'radial-gradient(circle, rgba(120,60,200,0.22) 0%, rgba(20,241,149,0.10) 45%, transparent 70%)',
              filter: 'blur(14px)',
              zIndex: -1,
              pointerEvents: 'none',
            }} />
            <KeyClient />
          </div>
        </div>
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '1rem', lineHeight: 1.7,
          color: 'rgba(255,255,255,0.45)', maxWidth: '480px', marginBottom: '64px',
        }}>
          SolanaSweeper is non-custodial. We never touch your keys, and no transaction moves without your signature.
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
            <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Security audit.</strong> A full audit is planned and on the roadmap. We will not claim &ldquo;audited&rdquo; until it is done. That is a deliberate choice, false trust signals are worse than none.
          </p>
        </div>
      </div>
    </InnerLayout>
  );
}
