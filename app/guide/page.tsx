import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { GUIDE_ARTICLES, SITE_URL } from '@/lib/guide';

export const metadata: Metadata = {
  title: 'The Guide to Reclaiming Locked SOL on Solana',
  description:
    'A plain-English guide to Solana rent and reclaiming locked SOL: what rent is, how to reclaim it, whether it is safe, what you cannot reclaim, and the common mistakes to avoid.',
  keywords: ['Solana guide', 'reclaim SOL', 'Solana rent', 'close token accounts', 'wallet cleaner guide'],
  alternates: { canonical: '/guide' },
  openGraph: {
    type: 'website',
    title: 'The Guide to Reclaiming Locked SOL on Solana',
    description: 'What rent is, how to reclaim it, whether it is safe, what you cannot reclaim, and the mistakes to avoid.',
    url: '/guide',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/guide`,
  url: `${SITE_URL}/guide`,
  name: 'The SolanaSweeper Guide',
  description: 'A plain-English guide to Solana rent and reclaiming locked SOL.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: GUIDE_ARTICLES.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/guide/${a.slug}`,
      name: a.h1,
    })),
  },
};

export default function GuideIndex() {
  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 72% 48% at 50% 0%, rgba(50,26,95,0.22) 0%, transparent 62%),
      radial-gradient(ellipse 46% 34% at 10% 6%, rgba(153,69,255,0.15) 0%, transparent 55%),
      radial-gradient(ellipse 44% 30% at 92% 10%, rgba(20,241,149,0.09) 0%, transparent 55%)
    `}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(100px, 14vw, 156px) clamp(24px, 6vw, 32px) 80px' }}>
        <header>
          <p style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 500,
            fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#14F195', margin: '0 0 18px',
          }}>
            The Guide
          </p>
          <h1 style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)', letterSpacing: '-0.03em',
            lineHeight: 1.08, color: '#fff', margin: '0 0 20px',
          }}>
            Reclaiming your locked SOL
          </h1>
          <p style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 400,
            fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)',
            margin: '0 0 8px', maxWidth: '600px',
          }}>
            Solana quietly locks small amounts of SOL in the token accounts your wallet creates. This
            guide explains what that is, how to get it back, and how to do it without getting burned.
            In plain English, no hype.
          </p>
        </header>

        <ol style={{
          listStyle: 'none', margin: '46px 0 0', padding: 0,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {GUIDE_ARTICLES.map((a, i) => (
            <li key={a.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <a
                href={`/guide/${a.slug}`}
                style={{
                  display: 'flex', gap: 'clamp(16px, 3vw, 26px)', alignItems: 'baseline',
                  padding: '24px 4px', textDecoration: 'none',
                }}
              >
                <span style={{
                  fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: '1rem',
                  color: 'rgba(153,69,255,0.75)', minWidth: '30px', flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ display: 'block' }}>
                  <span style={{ display: 'block', fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                    {a.h1}
                  </span>
                  <span style={{ display: 'block', fontFamily: 'General Sans, sans-serif', fontSize: '0.94rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                    {a.excerpt}
                  </span>
                  <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)' }}>
                    {a.readingTime}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', marginTop: '40px',
        }}>
          Prefer to just try it? <a href="/" style={{ color: 'rgba(20,241,149,0.85)', textDecoration: 'none' }}>Check any wallet</a>{' '}
          to see how much SOL is reclaimable, no connection needed.
        </p>
      </article>
    </InnerLayout>
  );
}
