import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { BLOG_ARTICLES, SITE_URL } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on Solana rent, token-account closures, and the mechanics of reclaiming the SOL locked in your wallet.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'The SolanaSweeper Blog',
    description: 'Notes on Solana rent, token-account closures, and reclaiming locked SOL.',
    url: '/blog',
    images: [`${SITE_URL}/og.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The SolanaSweeper Blog',
    description: 'Notes on Solana rent and reclaiming locked SOL.',
    images: [`${SITE_URL}/og.png`],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/blog`,
  url: `${SITE_URL}/blog`,
  name: 'The SolanaSweeper Blog',
  description: 'Notes on Solana rent and reclaiming locked SOL.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: BLOG_ARTICLES.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/blog/${a.slug}`,
      name: a.title,
    })),
  },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
// Veilige datum-format zonder Date-object (geen tijdzone-verschuiving bij build).
function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function BlogIndex() {
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
            Blog
          </p>
          <h1 style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)', letterSpacing: '-0.03em',
            lineHeight: 1.08, color: '#fff', margin: '0 0 20px',
          }}>
            The SolanaSweeper blog
          </h1>
          <p style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 400,
            fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)',
            margin: '0 0 8px', maxWidth: '600px',
          }}>
            Deep dives on Solana rent, token-account mechanics, and the SOL quietly locked in your
            wallet — what changes, what doesn&rsquo;t, and what it means for what you can reclaim.
          </p>
        </header>

        <ol style={{
          listStyle: 'none', margin: '46px 0 0', padding: 0,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {BLOG_ARTICLES.map((a) => (
            <li key={a.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <a
                href={`/blog/${a.slug}`}
                className="guide-row"
                style={{
                  display: 'block', padding: '24px 14px', margin: '0 -14px', textDecoration: 'none',
                }}
              >
                <span style={{ display: 'block', fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: '8px' }}>
                  {a.title}
                </span>
                <span style={{ display: 'block', fontFamily: 'General Sans, sans-serif', fontSize: '0.94rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                  {a.description}
                </span>
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)' }}>
                  {fmtDate(a.datePublished)} · {a.readingTime}
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
