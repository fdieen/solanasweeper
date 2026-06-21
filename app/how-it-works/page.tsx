import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import ScannerBot from '@/components/ScannerBot';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'Connect your wallet, scan for junk, and reclaim locked SOL in three steps. Fun Mode and Pro Mode explained.',
  alternates: { canonical: '/how-it-works' },
};

const steps = [
  {
    num: '01',
    title: 'Connect your wallet',
    body: 'Hit Connect Wallet and approve in Phantom, Solflare, or Backpack. We never touch your keys. The connection is read-only until you explicitly sign a transaction.',
    color: '#14F195',
  },
  {
    num: '02',
    title: 'Scan your accounts',
    body: 'SolSweep reads your on-chain token accounts and classifies them: empty accounts (junk, holding locked rent), tokens with residual value, and worthless SPL/NFT dust.',
    color: '#9945FF',
  },
  {
    num: '03',
    title: 'Reclaim your SOL',
    body: 'Select what to sweep. Fun Mode closes empty accounts and returns the ~0.002 SOL rent deposit per account straight to your wallet. Pro Mode also swaps leftover tokens to SOL via Jupiter, and burns true junk.',
    color: '#14F195',
  },
];

export default function HowItWorks() {
  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 90% 70% at 50% 40%, rgba(60,30,110,0.30) 0%, transparent 70%),
      radial-gradient(ellipse 70% 50% at 12% 8%, rgba(153,69,255,0.30) 0%, transparent 55%),
      radial-gradient(ellipse 60% 45% at 92% 18%, rgba(20,241,149,0.20) 0%, transparent 55%),
      radial-gradient(ellipse 65% 50% at 85% 95%, rgba(153,69,255,0.26) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 18% 100%, rgba(20,241,149,0.16) 0%, transparent 55%),
      linear-gradient(180deg, rgba(40,22,75,0.22) 0%, rgba(14,10,28,0.10) 50%, rgba(40,22,75,0.20) 100%)
    `}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        {/* Header */}
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          Three steps
        </p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
          lineHeight: 1.05, color: '#fff', marginBottom: '64px',
        }}>
          Connect, scan,<br />reclaim.
        </h1>

        {/* Steps — liquid glass cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step) => {
            const c = step.color === '#14F195' ? '20,241,149' : '153,69,255';
            return (
              <div key={step.num} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: '0 32px',
                padding: '32px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, rgba(${c},0.10) 0%, rgba(255,255,255,0.04) 45%, rgba(${c},0.06) 100%)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid rgba(${c},0.22)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(${c},0.08)`,
              }}>
                {/* Big number */}
                <div style={{
                  fontFamily: 'General Sans, sans-serif', fontWeight: 700,
                  fontSize: '3rem', lineHeight: 1,
                  color: step.color,
                  opacity: 0.95,
                  letterSpacing: '-0.04em',
                  paddingTop: '4px',
                  textShadow: `0 0 24px rgba(${c},0.4)`,
                }}>
                  {step.num}
                </div>

                <div>
                  <h2 style={{
                    fontFamily: 'General Sans, sans-serif', fontWeight: 600,
                    fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', letterSpacing: '-0.02em',
                    color: '#fff', marginBottom: '12px',
                  }}>
                    {step.title}
                  </h2>
                  <p style={{
                    fontFamily: 'General Sans, sans-serif', fontWeight: 400,
                    fontSize: '0.95rem', lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.5)', maxWidth: '520px',
                  }}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modes callout */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
          marginTop: '64px',
        }}>
          {[
            {
              label: 'Fun Mode',
              color: '#14F195',
              desc: 'Safe-only. Closes empty token accounts and reclaims rent. No tokens are destroyed.',
            },
            {
              label: 'Pro Mode',
              color: '#9945FF',
              desc: 'Advanced. Swap residual tokens to SOL via Jupiter, and burn true junk. Burns are permanent. You\'ll confirm before signing.',
            },
          ].map(({ label, color, desc }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <span style={{
                display: 'inline-block',
                fontFamily: 'General Sans, sans-serif', fontWeight: 600,
                fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                color, marginBottom: '12px',
              }}>
                {label}
              </span>
              <p style={{
                fontFamily: 'General Sans, sans-serif', fontWeight: 400,
                fontSize: '0.88rem', lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '64px' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            fontFamily: 'General Sans, sans-serif', fontWeight: 600,
            fontSize: '0.95rem',
            background: '#fff', color: '#05050a',
            border: 'none', borderRadius: '999px',
            padding: '14px 22px 14px 28px',
            textDecoration: 'none',
          }}>
            Start sweeping
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', background: '#05050a', borderRadius: '50%',
            }}>
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M2 6H12M12 6L8 2M12 6L8 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>
      </div>
      <ScannerBot />
    </InnerLayout>
  );
}
