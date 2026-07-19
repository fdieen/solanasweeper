import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referral Program — Earn 25% of Every Sweep',
  description:
    'Share SolanaSweeper and earn 25% of the platform fee on every sweep your referrals make. Lifetime, paid instantly in the sweep transaction, verifiable on-chain.',
  alternates: { canonical: '/referral' },
  openGraph: {
    type: 'website',
    title: 'SolanaSweeper Referral Program — Earn 25% of Every Sweep',
    description: '25% of platform fees, lifetime, paid instantly on-chain. No sign-up.',
    url: '/referral',
  },
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
