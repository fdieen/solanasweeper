'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import RobotMascot from './RobotMascot';
import ConnectWalletButton from './ConnectWalletButton';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const showRobot = pathname === '/';

  return (
    <>
      {showRobot && <RobotMascot menuOpen={open} />}
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
          <img src="/logo.svg" alt="SolSweep" style={{ height: '32px', width: 'auto' }} />
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
            padding: '8px 18px',
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

      {/* Slide-in menu */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '300px',
          background: '#0d0d18',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 50,
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1,
          }}
        >
          ×
        </button>

        {[
          { label: 'How it works', href: '/how-it-works' },
          { label: 'Safety', href: '/safety' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Roadmap', href: '/roadmap' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setOpen(false)}
            style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 500,
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
          >
            {label}
          </a>
        ))}

        <div style={{ marginTop: '24px' }}>
          <ConnectWalletButton fullWidth showArrow={false} />
        </div>
      </nav>
    </>
  );
}
