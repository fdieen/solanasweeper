'use client';

// Cube-effect in de footer is tijdelijk uitgezet — kan later terug.
// import dynamic from 'next/dynamic';
// const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

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
      {/* Cube-effect tijdelijk uitgezet — kan later terug:
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: 'clamp(120px, 16vw, 240px)',
        width: '200px',
        height: '150px',
        opacity: 0.8,
        pointerEvents: 'none',
      }}>
        <HeroCanvas transparent lookAt={[0, 0, 0]} />
      </div>
      */}

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
          <img src="/logo.svg" alt="SolSweep" style={{ height: '28px', width: 'auto' }} />
        </a>
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
      </div>
    </footer>
  );
}
