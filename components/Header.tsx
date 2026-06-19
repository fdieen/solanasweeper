'use client';

import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        <span style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
          SolSweep
        </span>
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

        {['How it works', 'Safety', 'FAQ', 'Roadmap'].map((item) => (
          <a
            key={item}
            href="#"
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
            {item}
          </a>
        ))}

        <button
          style={{
            marginTop: '24px',
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            background: '#fff',
            color: '#05050a',
            border: 'none',
            borderRadius: '999px',
            padding: '13px 24px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Connect Wallet
        </button>
      </nav>
    </>
  );
}
