'use client';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(120,40,255,0.18) 0%, rgba(153,69,255,0.10) 40%, rgba(80,20,200,0.14) 70%, rgba(100,30,220,0.08) 100%)',
      borderTop: '1px solid rgba(153,69,255,0.22)',
      boxShadow: 'inset 0 1px 0 rgba(180,100,255,0.15), 0 -1px 40px rgba(100,30,220,0.08)',
      padding: '48px clamp(24px, 6vw, 80px)',
      minHeight: '150px',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg?v=2" alt="SolanaSweeper" style={{ height: '28px', width: 'auto' }} />
        </a>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'How it works', href: '/how-it-works' },
            { label: 'Guide', href: '/guide' },
            { label: 'Safety', href: '/safety' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Roadmap', href: '/roadmap' },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 400,
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              {label}
            </a>
          ))}

          {/* Referral — subtiel groen accent */}
          <a href="/referral" style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 500,
            fontSize: '0.82rem',
            color: 'rgba(20,241,149,0.72)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#14F195')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(20,241,149,0.72)')}
          >
            Earn 25%
          </a>

          {/* X / Twitter — let op de underscore aan het eind (essentieel voor het juiste account) */}
          <a
            href="https://x.com/solanasweeper_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow SolanaSweeper on X"
            title="Follow @solanasweeper_ on X"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com/@SolanaSweeperOfficial"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subscribe to SolanaSweeper on YouTube"
            title="SolanaSweeper on YouTube"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@solanasweeperofficial"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow SolanaSweeper on TikTok"
            title="SolanaSweeper on TikTok"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
            </svg>
          </a>
        </div>
        <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          © 2026 SolanaSweeper · Non-custodial
        </span>
      </div>
    </footer>
  );
}
