'use client';

import { useState } from 'react';
import InnerLayout from '@/components/InnerLayout';
import AuroraBackground from '@/components/AuroraBackground';
import HelpBot from '@/components/HelpBot';

const faqs = [
  {
    q: 'What is SolSweep?',
    a: 'SolSweep is a non-custodial Solana dApp that helps you clean up your wallet. It closes empty token accounts, burns worthless tokens and NFTs, and swaps leftover tokens to SOL. All signed by you, nothing held by us.',
  },
  {
    q: 'What is rent reclaim?',
    a: 'Every Solana token account holds a small SOL deposit (~0.002 SOL) called rent. This rent is refunded when the account is closed. If you\'ve traded dozens of tokens, that adds up. SolSweep closes those accounts and returns the rent directly to your wallet.',
  },
  {
    q: 'Is it safe?',
    a: 'SolSweep is non-custodial. We never hold your keys or submit transactions without your signature. Fun Mode (closing empty accounts) is fully safe and reversible in the sense that nothing is destroyed. Pro Mode adds burns (irreversible) and swaps, which require explicit confirmation.',
  },
  {
    q: 'What\'s the difference between Fun Mode and Pro Mode?',
    a: 'Fun Mode only closes empty token accounts and reclaims rent. Nothing is destroyed, lowest risk. Pro Mode adds the ability to swap residual tokens to SOL via Jupiter, and to permanently burn worthless tokens or NFTs. Burns cannot be undone; we make that unmissable before you sign.',
  },
  {
    q: 'What is the fee?',
    a: 'SolSweep takes 5% of what you reclaim, rent recovered and swap proceeds. The fee is deducted from those proceeds, so you never pay out of pocket. If you reclaim nothing, there is no fee.',
  },
  {
    q: 'Can I lose tokens I actually want?',
    a: 'Not by accident. SolSweep only presents accounts for you to select. Nothing is touched until you explicitly choose it and sign the transaction. In Pro Mode, before any burn is executed, you will see a clear confirmation that the action is permanent.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'Phantom, Solflare, and Backpack at launch, via the standard Solana wallet-adapter. More wallets will be added on the roadmap.',
  },
  {
    q: 'Does SolSweep support Token-2022?',
    a: 'Yes. SolSweep scans both the original SPL Token program and the newer Token-2022 program accounts.',
  },
  {
    q: 'Which DEX does SolSweep use for swaps?',
    a: 'Jupiter, Solana\'s largest DEX aggregator. We route through Jupiter for best execution on token to SOL swaps. We do not run our own liquidity.',
  },
  {
    q: 'Is the code open source?',
    a: 'No. The codebase is closed source. All Solana transactions are public on-chain and fully inspectable in your wallet before signing.',
  },
];

function FaqItem({ q, a, open, toggle }: { q: string; a: string; open: boolean; toggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
      }}
      onClick={toggle}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 0', gap: '24px',
      }}>
        <span style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 500,
          fontSize: 'clamp(0.92rem, 1.5vw, 1.05rem)',
          color: open ? '#fff' : 'rgba(255,255,255,0.7)',
          lineHeight: 1.4,
          transition: 'color 0.15s',
        }}>
          {q}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M8 2V14M2 8H14" stroke={open ? '#14F195' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      {open && (
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.9rem', lineHeight: 1.75,
          color: 'rgba(255,255,255,0.45)',
          paddingBottom: '24px', maxWidth: '640px',
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <InnerLayout bgNode={<AuroraBackground />}>
      <HelpBot />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          Frequently asked
        </p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
          lineHeight: 1.05, color: '#fff', marginBottom: '56px',
        }}>
          Got questions?
        </h1>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {faqs.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              open={openIdx === i}
              toggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </InnerLayout>
  );
}
