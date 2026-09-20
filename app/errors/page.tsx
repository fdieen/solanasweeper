import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { ERROR_PAGES } from '@/lib/errors';
import { ErrorIndexSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: { absolute: 'Solana Error Messages, Explained | SolanaSweeper' },
  description:
    'What the common Solana transaction errors mean in plain English: simulation failed, custom program error 0x1, 0xb and 0x23, and how to clear each one.',
  keywords: [
    'solana error messages', 'custom program error solana', 'transaction simulation failed',
    'solana error 0x1', 'solana error 0xb', 'solana error 0x23', 'token program error',
  ],
  alternates: { canonical: '/errors' },
  openGraph: {
    type: 'website',
    title: 'Solana Error Messages, Explained',
    description:
      'Simulation failed, 0x1, 0xb, 0x23. What each one means and how to clear it.',
    url: '/errors',
  },
  twitter: { card: 'summary_large_image', title: 'Solana Error Messages, Explained' },
};

const errorBg = `
  radial-gradient(ellipse 70% 45% at 50% 0%, rgba(50,26,95,0.20) 0%, transparent 62%),
  radial-gradient(ellipse 45% 34% at 8% 5%, rgba(153,69,255,0.14) 0%, transparent 55%),
  radial-gradient(ellipse 44% 30% at 94% 8%, rgba(20,241,149,0.08) 0%, transparent 55%)
`;

export default function ErrorsIndex() {
  return (
    <InnerLayout bg={errorBg}>
      <ErrorIndexSchema />

      <section
        style={{
          maxWidth: '70ch',
          margin: '0 auto',
          padding: 'clamp(96px, 13vw, 148px) clamp(24px, 6vw, 32px) 72px',
        }}
      >
        <h1
          style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
            lineHeight: 1.1, color: '#fff', margin: '0 0 14px',
          }}
        >
          Solana errors, explained
        </h1>
        <p
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.82)', margin: '0 0 40px',
          }}
        >
          Wallets show you a program error code and almost no context. Here is what the common
          ones actually mean, and the shortest route out of each.
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ERROR_PAGES.map((e) => (
            <li key={e.slug} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <a
                href={`/errors/${e.slug}`}
                style={{ display: 'block', padding: '22px 4px', textDecoration: 'none' }}
              >
                <span
                  style={{
                    display: 'block', marginBottom: '8px',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.95rem', color: '#14F195',
                  }}
                >
                  {e.errorText}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'General Sans, sans-serif', fontSize: '1rem', lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.68)',
                  }}
                >
                  {e.excerpt}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p
          style={{
            marginTop: '44px', paddingTop: '26px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'General Sans, sans-serif', fontSize: '1rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.68)',
          }}
        >
          Seeing{' '}
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            insufficient funds for rent
          </span>{' '}
          instead? That one is about the SOL deposit every account has to hold, and it has{' '}
          <a href="/blog/insufficient-funds-for-rent-solana" style={{ color: '#14F195' }}>
            its own write-up
          </a>
          .
        </p>
      </section>
    </InnerLayout>
  );
}
