import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import ScannerBot from '@/components/ScannerBot';
import { FEE_PERCENT } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'How does SolanaSweeper work?',
  description:
    'SolanaSweeper scans your wallet for empty token accounts, batches them into as few transactions as possible, and returns the locked rent to your balance when you sign.',
  alternates: { canonical: '/how-it-works' },
};

const eyebrow: React.CSSProperties = {
  fontFamily: 'General Sans, sans-serif', fontWeight: 400,
  fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)', margin: '0 0 20px',
};

export default function HowItWorks() {
  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 90% 70% at 50% 40%, rgba(60,30,110,0.30) 0%, transparent 70%),
      radial-gradient(ellipse 70% 50% at 12% 8%, rgba(153,69,255,0.30) 0%, transparent 55%),
      radial-gradient(ellipse 60% 45% at 92% 18%, rgba(20,241,149,0.20) 0%, transparent 55%),
      radial-gradient(ellipse 65% 50% at 85% 95%, rgba(153,69,255,0.26) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 18% 100%, rgba(20,241,149,0.16) 0%, transparent 55%),
      linear-gradient(180deg, rgba(40,22,75,0.22) 0%, rgba(14,10,28,0.10) 50%, rgba(40,22,75,0.20) 100%)
    `}>
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 32px) 80px' }}>

        <p style={eyebrow}>How it works</p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
          lineHeight: 1.08, color: '#fff', margin: '0 0 20px',
        }}>
          How does SolanaSweeper work?
        </h1>
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.82)', margin: '0 0 8px',
          paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          SolanaSweeper scans your wallet for empty token accounts, batches them into as few
          transactions as possible, and returns the locked rent to your balance when you sign.
        </p>

        <div className="guide-prose">
          <h2>How do I connect my wallet?</h2>
          <p>Hit Connect Wallet and approve in Phantom, Solflare or Backpack.</p>
          <p>Any Solana wallet supporting the Wallet Standard is detected automatically. Mobile wallets connect by QR through WalletConnect. There is no account, no email and no signup.</p>

          <h2>What does the scan look for?</h2>
          <p>Every token account your wallet has ever opened, sorted into ones still holding something and ones holding nothing.</p>
          <p>Only the empty ones can be closed. Accounts still holding tokens are left alone, and Solana would refuse to close them anyway. Frozen accounts are excluded because they cannot be closed until the mint authority thaws them.</p>

          <h2>How much SOL will I get back?</h2>
          <p>{`About 0.00204 SOL per empty account, minus our ${FEE_PERCENT}% fee and the network fee.`}</p>
          <p>The scanner shows you the exact total before you sign anything. A wallet with 100 dead accounts is holding roughly 0.2 SOL. Token-2022 accounts with extensions can hold slightly more, and the <a href="/faq">FAQ</a> breaks down the fee math in detail.</p>

          <h2>How many transactions do I have to sign?</h2>
          <p>Usually far fewer than you have accounts, because closes are batched together.</p>
          <p>Solana caps transaction size, so large wallets are split across several transactions. Hardware wallet users should expect to approve each one on the device.</p>

          <h2>What can I reclaim besides empty accounts?</h2>
          <p>Pro Mode adds burning junk tokens and NFTs, and swapping leftovers through Jupiter.</p>
          <p>Burning is deliberately separate from closing. Fun Mode only touches accounts that are already empty, so nothing you own can be destroyed by accident. Pro Mode is where you choose to clear out dust and spam, and it asks you to confirm before anything is burned. That separation is a deliberate choice — see <a href="/founders">who builds SolanaSweeper</a>.</p>
        </div>

        {/* Related — minstens twee andere pagina's + de scanner */}
        <nav aria-label="Related" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: '48px', paddingTop: '26px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/safety" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>Is it safe? →</a>
          <a href="/guide/what-is-rent-on-solana" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>What is rent on Solana? →</a>
          <a href="/" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>Check a wallet →</a>
        </nav>

        {/* CTA */}
        <div style={{ marginTop: '28px' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem',
            background: '#fff', color: '#05050a', border: 'none', borderRadius: '999px',
            padding: '14px 22px 14px 28px', textDecoration: 'none',
          }}>
            Start sweeping
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#05050a', borderRadius: '50%' }}>
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M2 6H12M12 6L8 2M12 6L8 10" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>
      </article>
      <ScannerBot />
    </InnerLayout>
  );
}
