import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CircuitBackground from '@/components/CircuitBackground';
import HelpBot from '@/components/HelpBot';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import WalletScan from '@/components/WalletScan';
import WalletPreview from '@/components/WalletPreview';
import { Fragment } from 'react';
import { FEE_PERCENT } from '@/lib/pricing';

// Answer-first content onder de hero — kop = vraag, eerste zin = antwoord, met één
// contextuele link per sectie. Volgorde: rent, amount, safety, cost (referral staat lager).
const answers = [
  {
    q: 'What is the SOL locked in my token accounts?',
    answer: 'It is rent: a deposit Solana charges to store each token account on-chain, roughly 0.00204 SOL per account.',
    detail: 'Every token you have ever received opened its own account and locked that deposit. Selling the token does not give it back. The empty account sits there holding your SOL until someone closes it. It is not an airdrop or a reward, it is money you already paid.',
    link: { text: 'What is rent on Solana?', href: '/guide/what-is-rent-on-solana' },
  },
  {
    q: 'How much can I reclaim?',
    answer: 'About 0.00204 SOL per empty account, so a wallet with 100 dead accounts is holding roughly 0.2 SOL.',
    detail: 'Airdrop farmers, memecoin traders and anyone who has been on Solana for a while tend to have far more of these than they expect. Paste any address into the scanner and see the real number before deciding anything. The scan is read-only and needs no wallet connection.',
    link: { text: 'Scan a wallet', href: '/' },
  },
  {
    q: 'Is it safe to close token accounts?',
    answer: 'Yes. Solana refuses to close any account that still holds a balance, so tokens you own cannot be touched.',
    detail: 'SolanaSweeper is non-custodial and has no smart contract of its own. Every instruction in your transaction belongs to Solana itself, and nothing happens until you sign it in your own wallet. We never see your keys and never ask for your seed phrase.',
    link: { text: 'Read the safety page', href: '/safety' },
  },
  {
    q: 'What does SolanaSweeper cost?',
    answer: `${FEE_PERCENT}% of the SOL you reclaim, taken from the amount returned. Nothing up front, and nothing at all if there is nothing to reclaim.`,
    detail: 'The fee is a plain transfer inside the same transaction you approve, so you see the exact amount before signing. On a typical account you keep about 0.00184 SOL of the 0.00204 recovered.',
    link: { text: 'See how it works', href: '/how-it-works' },
  },
];

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

          {/* SOL-E (mascotte) op schermmidden — met de paarse glow eronder; klik/tap triggert
              de circuit-flits via CircuitBackground ('sol-e-tap'). */}
          <div className="hero-gem-glow" aria-hidden="true" />
          <div className="hero-gem-3d">
            <HelpBot variant="hero" />
          </div>

          {/* Hero-grid: mobiel verticale stack; desktop 3 kolommen —
              links tekst + trust-cards, midden de diamant (leeg), rechts de actie-kolom. */}
          <div className="hero-grid">

            {/* Links: hero-tekst */}
            <div className="hero-intro">
              <h1 style={{
                fontFamily: 'General Sans, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.4rem, 3.6vw, 3.6rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.035em',
                color: '#fff',
                margin: '0 0 22px',
              }}>
                Sweep your<br />dust into SOL
              </h1>
              <p style={{
                fontFamily: 'General Sans, sans-serif',
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.62)',
                margin: 0,
                maxWidth: '380px',
              }}>
                Every token you have ever held left about 0.00204 SOL behind in an empty account.
                SolanaSweeper closes them and returns the SOL to your wallet.
              </p>
            </div>

            {/* Rechts: actie-kolom */}
            <div className="hero-action">
              <ConnectWalletButton />
              <WalletScan />

              {/* Logische scheiding: primaire actie (Connect Wallet) vs. de gratis preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '360px', margin: '18px 0 0' }}>
                <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>or</span>
                <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <WalletPreview />
            </div>

            {/* Links-onder (desktop) / onderaan (mobiel): trust-cards */}
            <div className="hero-trust" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '10px', width: '100%', maxWidth: '360px' }}>
              {[
                { t: 'You sign every transaction', size: 0.85, pad: '9px 16px', icon: 15 },
                { t: 'Powered by Jupiter',         size: 0.85, pad: '9px 16px', icon: 15 },
                { t: 'Keys never leave your wallet', size: 0.85, pad: '9px 16px', icon: 15 },
              ].map(({ t, size, pad, icon }) => (
                <span key={t} style={{
                  display: 'flex',
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

              {/* Reclaim-box — zelfde chip-stijl (gelijke breedte), met de oplopende rekensom erin */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                background: 'linear-gradient(135deg, rgba(20,241,149,0.08) 0%, rgba(153,69,255,0.08) 100%)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
                <svg width={15} height={15} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M8 2.5v6M5.2 6 8 8.8 10.8 6M3.5 13h9" stroke="#14F195" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <span style={{ fontWeight: 500, lineHeight: 1.3 }}>
                    Reclaim <b style={{ color: '#14F195', fontWeight: 700 }}>~0.002&nbsp;SOL</b> per account you close
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.2px', lineHeight: 1.45 }}>
                    Adds up the more you sweep:<br />
                    25 ≈ 0.05 · 50 ≈ 0.10 · 100 ≈ <b style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>0.20&nbsp;SOL</b>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Answer-first content — de substance vóór de referral. Elke kop is een vraag,
            de eerste zin is het antwoord, met één contextuele link per sectie. */}
        <section style={{
          position: 'relative', zIndex: 10,
          background: '#04040a', borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 80px)',
        }}>
          <div className="guide-prose" style={{ maxWidth: '720px', margin: '0 auto' }}>
            {answers.map((a) => (
              <Fragment key={a.q}>
                <h2>{a.q}</h2>
                <p>{a.answer}</p>
                <p>{a.detail}</p>
                <p style={{ margin: '0 0 8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>→ </span>
                  <a href={a.link.href}>{a.link.text}</a>
                </p>
              </Fragment>
            ))}
          </div>
        </section>

        {/* Aankondigingsbanner — subtiel, groen accent, direct onder de hero */}
        <a href="/referral" className="ref-banner">
          <span className="ref-banner-tag">New</span>
          <span>earn 25% of fees by referring sweeps</span>
          <span className="ref-banner-arrow" aria-hidden="true">→</span>
        </a>

        {/* Referral-sectie — na de hero, drie kernpunten + CTA */}
        <section className="ref-section" aria-labelledby="ref-heading">
          <div className="ref-section-inner">
            <p className="ref-eyebrow">Referral program</p>
            <h2 id="ref-heading" className="ref-title">
              Share your link, earn <b>25%</b> of every sweep
            </h2>
            <p className="ref-lead" style={{ marginBottom: '18px' }}>
              Refer wallets to SolanaSweeper and 25% of the fee goes straight to you, inside the sweep
              transaction itself, on-chain, settled immediately.
            </p>
            <p className="ref-lead">
              There is no claim step and no dashboard to chase. The split happens in the same
              transaction the sweep does, which means your share arrives at the moment the sweep confirms.
            </p>

            <a href="/referral" className="ref-cta">
              Get your link
              <span className="ref-cta-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
