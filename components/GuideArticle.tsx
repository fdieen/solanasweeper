import InnerLayout from './InnerLayout';
import { GUIDE_ARTICLES, getGuideNav, SITE_URL, type GuideArticle } from '@/lib/guide';

const guideBg = `
  radial-gradient(ellipse 70% 45% at 50% 0%, rgba(50,26,95,0.20) 0%, transparent 62%),
  radial-gradient(ellipse 45% 34% at 8% 5%, rgba(153,69,255,0.14) 0%, transparent 55%),
  radial-gradient(ellipse 44% 30% at 94% 8%, rgba(20,241,149,0.08) 0%, transparent 55%)
`;

const linkStyle = { color: 'rgba(255,255,255,0.85)', textDecoration: 'none' } as const;

/**
 * Herbruikbare, rustige leeslayout voor /guide/<slug>.
 * Levert de enige <h1> (de body gebruikt alleen <h2>/<h3>), de Article-JSON-LD,
 * semantische structuur (article/header/nav/section), prev/next-navigatie en
 * interne links naar de rest van de guide.
 */
export default function GuideArticle({
  article,
  children,
}: {
  article: GuideArticle;
  children: React.ReactNode;
}) {
  const url = `${SITE_URL}/guide/${article.slug}`;
  const { index, total, prev, next } = getGuideNav(article.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: { '@type': 'Organization', name: 'SolanaSweeper', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'SolanaSweeper',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'CreativeWork', name: 'The SolanaSweeper Guide', url: `${SITE_URL}/guide` },
    image: `${SITE_URL}/og.png`,
    inLanguage: 'en',
  };

  return (
    <InnerLayout bg={guideBg}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article
        style={{
          maxWidth: '70ch',
          fontSize: '1.06rem',
          margin: '0 auto',
          padding: 'clamp(96px, 13vw, 148px) clamp(24px, 6vw, 32px) 72px',
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500,
            color: 'rgba(255,255,255,0.4)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <a href="/guide" className="guide-crumb">Guide</a>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <span>{article.h1}</span>
        </nav>

        <header>
          <h1
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
              lineHeight: 1.1, color: '#fff', margin: '0 0 14px',
            }}
          >
            {article.h1}
          </h1>
          <p
            style={{
              fontFamily: 'General Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.4)', margin: '0 0 30px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ color: '#14F195' }}>Guide</span>
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>·</span>
            <span>{article.readingTime}</span>
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>·</span>
            <span>{index + 1} of {total}</span>
          </p>
        </header>

        {/* Lead */}
        <p
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.82)', margin: '0 0 8px',
            paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {article.excerpt}
        </p>

        {/* Body — alleen semantische h2/h3, p, ul */}
        <div className="guide-prose">{children}</div>

        {/* Prev / next binnen de guide */}
        {(prev || next) && (
          <nav
            aria-label="Guide navigation"
            style={{
              marginTop: '52px', paddingTop: '26px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px',
            }}
          >
            {prev ? (
              <a href={`/guide/${prev.slug}`} style={{ ...linkStyle, padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>← Previous</span>
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{prev.h1}</span>
              </a>
            ) : <span />}
            {next ? (
              <a href={`/guide/${next.slug}`} style={{ ...linkStyle, padding: '16px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Next →</span>
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{next.h1}</span>
              </a>
            ) : <span />}
          </nav>
        )}

        {/* Terug naar het overzicht */}
        <p style={{ textAlign: 'center', margin: '18px 0 0' }}>
          <a href="/guide" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>
            ← Back to the guide overview
          </a>
        </p>

        {/* CTA terug naar de app */}
        <aside
          style={{
            marginTop: '20px', padding: '22px 24px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(20,241,149,0.07), rgba(153,69,255,0.07))',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#fff', margin: '0 0 3px' }}>
              See how much SOL you can reclaim
            </p>
            <p style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Paste any address on solanasweeper.com. No connection needed.
            </p>
          </div>
          <a
            href="/"
            style={{
              flexShrink: 0,
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              color: '#05140d', background: 'linear-gradient(135deg, #14F195 0%, #9945FF 150%)',
              padding: '11px 20px', borderRadius: '12px', textDecoration: 'none',
            }}
          >
            Check a wallet
          </a>
        </aside>

        {/* Volledige guide — interne links naar alle onderdelen */}
        <nav aria-label="In this guide" style={{ marginTop: '52px' }}>
          <h2
            style={{
              fontFamily: 'General Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              margin: '0 0 14px',
            }}
          >
            The full guide
          </h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, counterReset: 'g' }}>
            {GUIDE_ARTICLES.map((a) => {
              const current = a.slug === article.slug;
              return (
                <li key={a.slug} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <a
                    href={`/guide/${a.slug}`}
                    aria-current={current ? 'page' : undefined}
                    style={{
                      display: 'flex', alignItems: 'baseline', gap: '14px',
                      padding: '13px 4px', textDecoration: 'none',
                      fontFamily: 'General Sans, sans-serif', fontSize: '0.98rem',
                      color: current ? '#14F195' : 'rgba(255,255,255,0.7)', fontWeight: current ? 600 : 500,
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', minWidth: '18px' }}>
                      {String(GUIDE_ARTICLES.indexOf(a) + 1).padStart(2, '0')}
                    </span>
                    {a.h1}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </article>
    </InnerLayout>
  );
}
