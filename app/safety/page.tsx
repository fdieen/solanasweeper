import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import KeyClient from '@/components/KeyClient';
import { FEE_PERCENT } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Is SolanaSweeper safe to use?',
  description:
    'SolanaSweeper is non-custodial: it never holds your keys, never asks for your seed phrase, and cannot move a lamport without a transaction you sign yourself.',
  alternates: { canonical: '/safety' },
};

const eyebrow: React.CSSProperties = {
  fontFamily: 'General Sans, sans-serif', fontWeight: 400,
  fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)', margin: '0 0 20px',
};

export default function Safety() {
  return (
    <InnerLayout bg={`
      radial-gradient(ellipse 90% 70% at 50% 35%, rgba(40,30,90,0.30) 0%, transparent 70%),
      radial-gradient(ellipse 65% 50% at 90% 12%, rgba(20,241,149,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 10% 10%, rgba(153,69,255,0.24) 0%, transparent 55%),
      radial-gradient(ellipse 65% 50% at 85% 95%, rgba(20,241,149,0.16) 0%, transparent 60%),
      radial-gradient(ellipse 55% 45% at 15% 100%, rgba(153,69,255,0.20) 0%, transparent 55%),
      linear-gradient(180deg, rgba(30,20,60,0.22) 0%, rgba(12,10,26,0.10) 50%, rgba(20,40,40,0.18) 100%)
    `}>
      <article style={{ position: 'relative', zIndex: 2, maxWidth: '760px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 32px) 80px' }}>

        <p style={eyebrow}>Security &amp; trust</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 3vw, 36px)', marginBottom: '20px' }}>
          <h1 style={{
            fontFamily: 'General Sans, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
            lineHeight: 1.08, color: '#fff', margin: 0,
          }}>
            Is SolanaSweeper safe to use?
          </h1>
          <div style={{ position: 'relative', zIndex: 3, width: 'clamp(96px, 14vw, 150px)', height: 'clamp(96px, 14vw, 150px)', flexShrink: 0 }}>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '-10%',
              background: 'radial-gradient(circle, rgba(120,60,200,0.22) 0%, rgba(20,241,149,0.10) 45%, transparent 70%)',
              filter: 'blur(14px)', zIndex: -1, pointerEvents: 'none',
            }} />
            <KeyClient />
          </div>
        </div>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.82)', margin: '0 0 8px',
          paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          SolanaSweeper is non-custodial: it never holds your keys, never asks for your seed phrase,
          and cannot move a single lamport without a transaction you sign yourself.
        </p>

        <div className="guide-prose">
          <h2>Can SolanaSweeper access my funds?</h2>
          <p>No. The only thing SolanaSweeper can do is build a transaction and show it to you. Your wallet decides whether it happens.</p>
          <p>Signing is the security boundary. We never see your private key, and there is no step where you hand over control of anything. If you close the tab mid-way, nothing has happened.</p>

          <h2>Does SolanaSweeper have its own smart contract?</h2>
          <p>No. SolanaSweeper has no on-chain program of its own, so there is no custom contract you need to trust.</p>
          <p>Every instruction in your transaction belongs to Solana itself. Closing accounts uses the SPL Token and Token-2022 programs. The fee is a plain System Program transfer. Priority fees use the Compute Budget program. There is no deployed bytecode of ours that could drift from published source, and no upgrade authority anyone could flip.</p>

          <h2>What exactly am I signing?</h2>
          <p>Close instructions and nothing else. In Fun Mode your transaction contains <code>closeAccount</code> instructions plus one <code>SystemProgram.transfer</code> for the fee.</p>
          <p>Your wallet shows you all of it before you approve. What you should see:</p>
          <ul>
            <li>A positive SOL change into your wallet</li>
            <li><code>closeAccount</code> instructions for accounts holding zero tokens</li>
            <li>{`One transfer for our ${FEE_PERCENT}% fee`}</li>
          </ul>
          <p>What should never be there:</p>
          <ul>
            <li><code>setAuthority</code></li>
            <li><code>approve</code> or any delegate instruction</li>
            <li>Transfers of tokens you still hold</li>
            <li>SOL going to an address that is not yours</li>
          </ul>
          <p>If you see any of the second list, cancel. That applies to every tool, not just ours.</p>

          <h2>Can I burn tokens by accident?</h2>
          <p>No. Fun Mode only touches accounts that are already empty, so nothing you own can be destroyed there.</p>
          <p>Burning lives in Pro Mode and is a separate, deliberate choice. It is irreversible, which is why the confirmation before it is unmissable. If you never leave Fun Mode, no token is ever destroyed.</p>

          <h2>Are the swaps safe?</h2>
          <p>Swaps in Pro Mode are routed through Jupiter, Solana&rsquo;s largest DEX aggregator. We do not run liquidity pools and never take the other side of your trade.</p>
          <p>The swap transaction is built by Jupiter, not by us. You see the route and the expected output in your wallet before signing, same as every other transaction here.</p>

          <h2>Can I check my wallet without connecting it?</h2>
          <p>Yes. Paste any Solana address into <a href="/">the scanner</a> and see what is reclaimable before connecting anything.</p>
          <p>The scan is read-only and touches public on-chain data only. You can run it on a wallet you do not even own.</p>

          <h2>How do I know I am on the real site?</h2>
          <p>The only official domain is solanasweeper.com. Bookmark it and reach the site from your own bookmark rather than from a link in a DM, ad, or search result.</p>
          <p>Wallet cleanup tools are a common target for phishing clones, because &ldquo;claim your free SOL&rdquo; is exactly the promise a drainer wants to make. Any site asking for your seed phrase is a drainer, without exception, and no legitimate tool ever needs it.</p>

          <h2>Can I read the code?</h2>
          <p>Yes. The source is public at <a href="https://github.com/fdieen/solanasweeper" target="_blank" rel="noopener noreferrer">github.com/fdieen/solanasweeper</a> under an MIT license.</p>
          <p>You do not have to take our word for what the app does. Read it, watch the transaction in your own wallet, or see <a href="/founders">who builds it</a>.</p>
        </div>

        {/* Related — elke pagina linkt naar minstens twee andere + de scanner */}
        <nav aria-label="Related" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: '48px', paddingTop: '26px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/how-it-works" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>How SolanaSweeper works →</a>
          <a href="/faq" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>Frequently asked →</a>
          <a href="/" className="guide-crumb" style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 500, fontSize: '0.9rem' }}>Check a wallet →</a>
        </nav>

        {/* Audit-note behouden — sterk trust-signaal, niet in de nieuwe copy */}
        <aside style={{ marginTop: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '22px 26px' }}>
          <p style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 400, fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Security audit.</strong> A full audit is planned and on the roadmap. We will not claim &ldquo;audited&rdquo; until it is done. That is a deliberate choice — false trust signals are worse than none.
          </p>
        </aside>
      </article>
    </InnerLayout>
  );
}
