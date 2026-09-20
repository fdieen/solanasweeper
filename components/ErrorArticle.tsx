import Link from 'next/link';
import InnerLayout from './InnerLayout';
import { ERROR_PAGES, type ErrorPage } from '@/lib/errors';
import { ErrorSchema } from './StructuredData';

const errorBg = `
  radial-gradient(ellipse 70% 45% at 50% 0%, rgba(50,26,95,0.20) 0%, transparent 62%),
  radial-gradient(ellipse 45% 34% at 8% 5%, rgba(153,69,255,0.14) 0%, transparent 55%),
  radial-gradient(ellipse 44% 30% at 94% 8%, rgba(20,241,149,0.08) 0%, transparent 55%)
`;

/**
 * Leeslayout voor /errors/<slug>. Zelfde typografie als de guide, met één verschil:
 * bovenaan staat de letterlijke foutmelding in een codeblok. Iemand die hier binnenkomt
 * wil binnen een seconde zien of dit zijn melding is, nog voor hij begint te lezen.
 *
 * De body levert alleen h2/h3 + p/ul/pre; de enige h1 komt hieruit.
 */
export default function ErrorArticle({
  page,
  children,
}: {
  page: ErrorPage;
  children: React.ReactNode;
}) {
  return (
    <InnerLayout bg={errorBg}>
      <ErrorSchema page={page} />

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
          <a href="/errors" className="guide-crumb">Errors</a>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <span>{page.code ?? page.h1}</span>
        </nav>

        <header>
          <h1
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.7rem, 3.4vw, 2.6rem)', letterSpacing: '-0.03em',
              lineHeight: 1.15, color: '#fff', margin: '0 0 14px',
            }}
          >
            {page.h1}
          </h1>
          <p
            style={{
              fontFamily: 'General Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.4)', margin: '0 0 24px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ color: '#14F195' }}>Error</span>
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>·</span>
            <span>{page.readingTime}</span>
          </p>
        </header>

        {/* De letterlijke melding: herkenning vóór uitleg. */}
        <div
          style={{
            padding: '14px 18px', borderRadius: '12px', marginBottom: '28px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '3px solid #14F195',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.92rem', color: 'rgba(255,255,255,0.88)',
            overflowX: 'auto', whiteSpace: 'nowrap',
          }}
        >
          {page.errorText}
        </div>

        {/* Lead: het antwoord, nog voor de uitleg. */}
        <p
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.82)', margin: '0 0 8px',
            paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {page.excerpt}
        </p>

        <div className="guide-prose blog-prose">{children}</div>

        {/* CTA terug naar de checker */}
        <aside
          style={{
            marginTop: '48px', padding: '22px 24px', borderRadius: '16px',
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
          <Link
            href="/"
            style={{
              flexShrink: 0,
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              color: '#05140d', background: 'linear-gradient(135deg, #14F195 0%, #9945FF 150%)',
              padding: '11px 20px', borderRadius: '12px', textDecoration: 'none',
            }}
          >
            Check a wallet
          </Link>
        </aside>

        {/* Andere meldingen */}
        <nav aria-label="Other errors" style={{ marginTop: '52px' }}>
          <h2
            style={{
              fontFamily: 'General Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              margin: '0 0 14px',
            }}
          >
            Other Solana errors
          </h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {ERROR_PAGES.map((e) => {
              const current = e.slug === page.slug;
              return (
                <li key={e.slug} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <a
                    href={`/errors/${e.slug}`}
                    aria-current={current ? 'page' : undefined}
                    style={{
                      display: 'block', padding: '13px 4px', textDecoration: 'none',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: '0.92rem',
                      color: current ? '#14F195' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {e.errorText}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </article>
    </InnerLayout>
  );
}
