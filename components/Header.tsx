'use client';

import { useState, type ReactNode } from 'react';
import ConnectWalletButton from './ConnectWalletButton';

/* Line-icons (huisstijl, stroke = currentColor → krijgt de teal-tint van de tegel) */
const ICONS: Record<string, ReactNode> = {
  book: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5C7 5 10 5.5 12 7c2-1.5 5-2 8-1.5V18c-3-.5-6 0-8 1.5-2-1.5-5-2-8-1.5V5.5z" />
      <path d="M12 7v12.5" />
    </svg>
  ),
  shield: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 2.6v5.2c0 4.4-3 7.9-7 9.9-4-2-7-5.5-7-9.9V5.6L12 3z" />
      <path d="M9 11.5l2.2 2.2L15.5 9" />
    </svg>
  ),
  faq: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.3a2.7 2.7 0 015.2 1c0 1.8-2.6 2.3-2.6 4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  map: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  guide: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.5h6A2.5 2.5 0 0111.5 8v11a2 2 0 00-2-2H3z" />
      <path d="M21 5.5h-6A2.5 2.5 0 0012.5 8v11a2 2 0 012-2H21z" />
    </svg>
  ),
  gift: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8" />
      <path d="M3 8.5h18V12H3z" />
      <path d="M12 8.5V21" />
      <path d="M12 8.5S10.5 3.5 8 4.2C6.3 4.7 6.4 7 8 8c1.2.7 4 .5 4 .5zM12 8.5s1.5-5 4-4.3C21.7 4.7 17.6 7 16 8c-1.2.7-4 .5-4 .5z" />
    </svg>
  ),
  users: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.6 19.4a5.6 5.6 0 0 1 10.8 0" />
      <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6" />
      <path d="M17 14a5.6 5.6 0 0 1 3.4 5" />
    </svg>
  ),
};

const MENU: { title: string; items: { label: string; href: string; icon: string }[] }[] = [
  {
    title: 'Learn',
    items: [
      { label: 'How it works', href: '/how-it-works', icon: 'book' },
      { label: 'Guide', href: '/guide', icon: 'guide' },
      { label: 'Safety', href: '/safety', icon: 'shield' },
      { label: 'FAQ', href: '/faq', icon: 'faq' },
    ],
  },
  {
    title: 'Project',
    items: [
      { label: 'Earn 25%', href: '/referral', icon: 'gift' },
      { label: 'Roadmap', href: '/roadmap', icon: 'map' },
      { label: 'Founders', href: '/founders', icon: 'users' },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 py-4"
        style={{
          background: 'linear-gradient(180deg, rgba(12,8,24,0.30) 0%, rgba(12,8,24,0.12) 100%)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
          borderBottom: '1px solid rgba(153,69,255,0.16)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        <div className="hero-container flex items-center justify-between">
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg?v=2" alt="SolanaSweeper" style={{ height: '32px', width: 'auto' }} />
        </a>

        {/* Desktop-nav: links direct in de header; op mobiel via de Menu-knop */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '28px' }}>
          {[
            { label: 'How it works', href: '/how-it-works' },
            { label: 'Guide', href: '/guide' },
            { label: 'Safety', href: '/safety' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Roadmap', href: '/roadmap' },
            { label: 'Founders', href: '/founders' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.62)', textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.62)')}
            >
              {label}
            </a>
          ))}
          {/* Referral — subtiel groen accent zodat het als promo opvalt, niet schreeuwerig */}
          <a
            href="/referral"
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              color: '#14F195', textDecoration: 'none', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#5cffbf')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#14F195')}
          >
            Earn 25%
          </a>
        </nav>

        <div className="md:hidden">
        <button
          onClick={() => setOpen(true)}
          style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            borderRadius: '999px',
            padding: '7px 15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <rect width="14" height="1.5" rx="0.75" fill="white"/>
            <rect y="4.25" width="10" height="1.5" rx="0.75" fill="white"/>
            <rect y="8.5" width="14" height="1.5" rx="0.75" fill="white"/>
          </svg>
          Menu
        </button>
        </div>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in menu — gecategoriseerde lijst-layout */}
      <nav
        aria-label="Main menu"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '320px', maxWidth: '86vw',
          background: 'linear-gradient(180deg, #140f21 0%, #0b0912 100%)',
          borderLeft: '1px solid rgba(153,69,255,0.18)',
          boxShadow: '-24px 0 70px rgba(0,0,0,0.5)',
          zIndex: 50,
          padding: '22px 20px 24px',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Subtiele aurora-accent bovenin (huisstijl) */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '170px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 85% 100% at 82% 0%, rgba(153,69,255,0.16), transparent 70%), radial-gradient(ellipse 60% 90% at 8% 0%, rgba(20,241,149,0.07), transparent 70%)',
        }} />

        {/* Kop: logo + sluitknop */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <img src="/logo.svg?v=2" alt="SolanaSweeper" style={{ height: '26px', width: 'auto' }} />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.15rem', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Primaire actie */}
        <div style={{ position: 'relative', marginBottom: '26px' }}>
          <ConnectWalletButton fullWidth showArrow={false} />
        </div>

        {/* Categorieën */}
        {MENU.map((section) => (
          <div key={section.title} style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>
                {section.title}
              </span>
              <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.14), transparent)' }} />
            </div>
            {section.items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px', margin: '0 -10px', borderRadius: '12px',
                  fontFamily: 'General Sans, sans-serif', fontSize: '0.98rem', fontWeight: 500,
                  color: 'rgba(255,255,255,0.82)', textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}
              >
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '34px', height: '34px', flexShrink: 0, borderRadius: '9px', color: '#14F195',
                  background: 'linear-gradient(135deg, rgba(20,241,149,0.12), rgba(153,69,255,0.12))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {ICONS[it.icon]}
                </span>
                {it.label}
              </a>
            ))}
          </div>
        ))}

        {/* Socials — onderaan het paneel */}
        <div style={{ position: 'relative', marginTop: 'auto', paddingTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>
              Follow
            </span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.14), transparent)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="https://x.com/solanasweeper_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow SolanaSweeper on X"
              title="Follow @solanasweeper_ on X"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com/@SolanaSweeperOfficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to SolanaSweeper on YouTube"
              title="SolanaSweeper on YouTube"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@solanasweeperofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow SolanaSweeper on TikTok"
              title="SolanaSweeper on TikTok"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/solanasweeperofficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow SolanaSweeper on Instagram"
              title="SolanaSweeper on Instagram"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a
              href="https://t.me/solanasweeper"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join SolanaSweeper on Telegram"
              title="SolanaSweeper on Telegram"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: '10px',
                color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.91 3.79 20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.55-1.13.55l.4-5.63 10.26-9.31c.45-.4-.1-.62-.68-.22L6.24 13.11.9 11.44c-1.16-.36-1.18-1.16.24-1.72l20.87-8.05c.97-.36 1.82.22 1.5 1.72z"/>
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
