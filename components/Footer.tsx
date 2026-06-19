'use client';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 10,
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '40px clamp(24px, 6vw, 80px)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      <span style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
        SolSweep
      </span>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'How it works', href: '/how-it-works' },
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
      </div>
      <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
        © 2025 SolSweep · Non-custodial
      </span>
    </footer>
  );
}
