import Header from '@/components/Header';
import HeroClient from '@/components/HeroClient';

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#04040a' }}>
      {/* Three.js background */}
      <HeroClient />

      {/* Atmospheric CSS glows */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 75% 65% at -2% 118%, rgba(130,25,255,0.90) 0%, transparent 55%),
          radial-gradient(ellipse 65% 60% at 95% 118%, rgba(20,241,149,0.72) 0%, transparent 52%),
          radial-gradient(ellipse 110% 35% at 50% 105%, rgba(90,10,180,0.50) 0%, transparent 48%),
          radial-gradient(ellipse 40% 30% at 50% 100%, rgba(153,69,255,0.30) 0%, transparent 60%)
        `,
      }} />

      {/* UI layer */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <Header />

        {/* Hero */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(80px, 12vw, 140px) clamp(24px, 6vw, 80px) 60px',
          maxWidth: '520px',
        }}>
          <p style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 400,
            fontSize: '0.82rem',
            letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}>
            Non-custodial · built on Solana
          </p>

          <h1 style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.6rem, 5.5vw, 5.2rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: '24px',
          }}>
            Sweep Your Dust<br />Into SOL
          </h1>

          <p style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '40px',
            maxWidth: '360px',
          }}>
            Close thousands of empty token accounts in one click. Reclaim your locked SOL and keep your wallet clean.
          </p>

          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            background: '#fff',
            color: '#05050a',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 22px 14px 28px',
            cursor: 'pointer',
            width: 'fit-content',
          }}>
            Connect Wallet
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: '#05050a', borderRadius: '50%',
            }}>
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M2 6H12M12 6L8 2M12 6L8 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* Trust signals */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '32px',
          }}>
            {[
              'You sign every transaction',
              'Powered by Jupiter',
              'Keys never leave your wallet',
            ].map((t) => (
              <span key={t} style={{
                fontFamily: 'General Sans, sans-serif',
                fontWeight: 400,
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
                padding: '5px 12px',
              }}>
                {t}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
