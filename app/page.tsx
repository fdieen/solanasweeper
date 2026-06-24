import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CircuitBackground from '@/components/CircuitBackground';
import GemClient from '@/components/GemClient';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import WalletScan from '@/components/WalletScan';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#04040a', display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header />

        <section style={{
          flex: 1,
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background: '#04040a',
        }}>
          {/* Foto-achtergrond */}
          <img src="/hero-bg.jpg" alt="" aria-hidden="true" className="hero-bg-img" />

          {/* Circuit-draden transparant over de foto */}
          <CircuitBackground showLogo={false} background="transparent" />

          {/* Donkere gradient links voor leesbare tekst, rechts foto zichtbaar */}
          <div className="hero-overlay" aria-hidden="true" />

          {/* Echte 3D edelsteen, centraal */}
          <div className="hero-gem-glow" aria-hidden="true" />
          <div className="hero-gem-3d">
            <GemClient />
          </div>

          {/* Tekst links — absoluut, verticaal gecentreerd */}
          <div className="hero-text" style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
            padding: 'clamp(80px, 10vw, 120px) clamp(32px, 6vw, 100px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <h1 style={{
              fontFamily: 'General Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2.6rem, 4.2vw, 5rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              color: '#fff',
              marginBottom: '28px',
            }}>
              Sweep your<br />dust into SOL
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

            <div style={{ marginBottom: '36px' }}>
              <ConnectWalletButton />
              <WalletScan />
            </div>

            <div className="hero-badges" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              {[
                { t: 'You sign every transaction', size: 0.85, pad: '9px 16px', icon: 15 },
                { t: 'Powered by Jupiter',         size: 0.85, pad: '9px 16px', icon: 15 },
                { t: 'Keys never leave your wallet', size: 0.85, pad: '9px 16px', icon: 15 },
              ].map(({ t, size, pad, icon }) => (
                <span key={t} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'General Sans, sans-serif',
                  fontWeight: 500,
                  fontSize: `${size}rem`,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'linear-gradient(135deg, rgba(20,241,149,0.08) 0%, rgba(153,69,255,0.08) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: pad,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}>
                  <svg width={icon} height={icon} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 7.5L5.5 11L12 3.5" stroke="#14F195" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
