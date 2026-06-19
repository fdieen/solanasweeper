import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Atmospheric glows — fixed, achter alles */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 55% at -5% 110%, rgba(130,25,255,0.85) 0%, transparent 55%),
          radial-gradient(ellipse 55% 50% at 100% 110%, rgba(20,241,149,0.65) 0%, transparent 52%),
          radial-gradient(ellipse 90% 30% at 50% 108%, rgba(90,10,180,0.45) 0%, transparent 48%)
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header />

        {/* Hero — volledig scherm, content links uitgelijnd, verticaal gecentreerd */}
        <section style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(32px, 7vw, 100px)',
          minHeight: '100vh',
        }}>
          <div style={{ maxWidth: '480px', width: '100%' }}>

            <p style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 400,
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.38)',
              marginBottom: '28px',
              textTransform: 'uppercase',
            }}>
              Non-custodial · built on Solana
            </p>

            <h1 style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.8rem, 5vw, 5rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              color: '#fff',
              marginBottom: '28px',
            }}>
              Sweep Your<br />Dust Into SOL
            </h1>

            <p style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 400,
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.42)',
              marginBottom: '44px',
              maxWidth: '340px',
            }}>
              Close empty token accounts, reclaim locked SOL, and clean your wallet in one click.
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
              padding: '13px 18px 13px 26px',
              cursor: 'pointer',
              width: 'fit-content',
              marginBottom: '36px',
            }}>
              Connect Wallet
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px',
                background: '#05050a', borderRadius: '50%',
              }}>
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                  <path d="M2 6H12M12 6L8 2M12 6L8 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['You sign every transaction', 'Powered by Jupiter', 'Keys never leave your wallet'].map((t) => (
                <span key={t} style={{
                  fontFamily: 'General Sans, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '999px',
                  padding: '5px 12px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
