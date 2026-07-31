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
            { label: 'Blog', href: '/blog' },
            { label: 'Safety', href: '/safety' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Roadmap', href: '/roadmap' },
            { label: 'Founders', href: '/founders' },
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

          {/* Instagram */}
          <a
            href="https://instagram.com/solanasweeperofficial"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow SolanaSweeper on Instagram"
            title="SolanaSweeper on Instagram"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/solanasweeper"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join SolanaSweeper on Telegram"
            title="SolanaSweeper on Telegram"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.55-1.13.55l.4-5.63 10.26-9.31c.45-.4-.1-.62-.68-.22L6.24 13.11.9 11.44c-1.16-.36-1.18-1.16.24-1.72l20.87-8.05c.97-.36 1.82.22 1.5 1.72z"/>
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
