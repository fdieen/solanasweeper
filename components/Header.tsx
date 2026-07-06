'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import RobotMascot from './RobotMascot';
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
};

const MENU: { title: string; items: { label: string; href: string; icon: string }[] }[] = [
  {
    title: 'Learn',
    items: [
      { label: 'How it works', href: '/how-it-works', icon: 'book' },
      { label: 'Safety', href: '/safety', icon: 'shield' },
      { label: 'FAQ', href: '/faq', icon: 'faq' },
    ],
  },
  {
    title: 'Project',
    items: [{ label: 'Roadmap', href: '/roadmap', icon: 'map' }],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const showRobot = pathname === '/';

  return (
    <>
      {/* Robot alleen op desktop (>=md): op mobiel overlapte hij de Connect-knop.
          Wrapper met display:none verbergt ook de position:fixed inhoud. */}
      {showRobot && (
        <div className="hidden md:block">
          <RobotMascot menuOpen={open} />
        </div>
      )}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
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
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg?v=2" alt="SolanaSweeper" style={{ height: '32px', width: 'auto' }} />
        </a>
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
        </div>
      </nav>
    </>
  );
}
