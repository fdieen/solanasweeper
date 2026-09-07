import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { getBlog, SITE_URL } from '@/lib/blog';
import { BlogPostSchema } from '@/components/StructuredData';

const article = getBlog('solana-rent-reduction-live-what-it-means')!;

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: `/blog/${article.slug}` },
  openGraph: {
    type: 'article',
    title: article.title,
    description: article.description,
    url: `/blog/${article.slug}`,
    publishedTime: article.datePublished,
    // Next erft de root-og.png niet in een eigen openGraph → expliciet zetten.
    images: [`${SITE_URL}/og.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.description,
    images: [`${SITE_URL}/og.png`],
  },
};

const blogBg = `
  radial-gradient(ellipse 70% 45% at 50% 0%, rgba(50,26,95,0.20) 0%, transparent 62%),
  radial-gradient(ellipse 45% 34% at 8% 5%, rgba(153,69,255,0.14) 0%, transparent 55%),
  radial-gradient(ellipse 44% 30% at 94% 8%, rgba(20,241,149,0.08) 0%, transparent 55%)
`;

// Externe referentie-link: nieuw tabblad + veilige rel (zoals in de Agave-post).
function Ref({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function BlogRentReductionLive() {
  return (
    <InnerLayout bg={blogBg}>
      <BlogPostSchema article={article} />

      <article
        style={{
          maxWidth: '70ch',
          fontSize: '1.06rem',
          margin: '0 auto',
          padding: 'clamp(96px, 13vw, 148px) clamp(24px, 6vw, 32px) 72px',
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '0.8rem', fontWeight: 500,
            color: 'rgba(255,255,255,0.4)', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <a href="/" className="guide-crumb">Home</a>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <a href="/blog" className="guide-crumb">Blog</a>
        </nav>

        <header>
          <h1
            style={{
              fontFamily: 'General Sans, sans-serif', fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
              lineHeight: 1.1, color: '#fff', margin: '0 0 14px',
            }}
          >
            Solana just cut rent by 9%. Here is what that actually means for your wallet.
          </h1>
          <p
            style={{
              fontFamily: 'General Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.4)', margin: '0 0 30px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ color: '#14F195' }}>Blog</span>
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>·</span>
            <time dateTime={article.datePublished}>September 7, 2026</time>
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>·</span>
            <span>{article.readingTime}</span>
          </p>
        </header>

        {/* Lead */}
        <p
          style={{
            fontFamily: 'General Sans, sans-serif', fontSize: '1.2rem', lineHeight: 1.65,
            color: 'rgba(255,255,255,0.82)', margin: '0 0 8px',
            paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {article.description}
        </p>

        {/* Body — hergebruikt de guide-prose typografie; blog-prose voegt tabel + codeblok toe */}
        <div className="guide-prose blog-prose">
          <p>
            On September 3, 2026, Solana activated the first step of SIMD-0437, the{' '}
            <a href="/blog/agave-4-2-rent-reduction-reclaimable-sol">rent reduction plan</a>. The
            rent-exempt requirement dropped from 6,960 to 6,333 lamports per byte, roughly 9% lower.
            It is the first of five steps that together should cut rent by about 90% by late 2026.
          </p>
          <p>
            Within a day, several tools were promising &ldquo;free SOL&rdquo; and &ldquo;reclaim
            10%&rdquo;. The idea is right. The framing is a bit loose. Here is the precise version.
          </p>

          <h2>What changed on September 3</h2>
          <p>
            Every account on Solana holds a deposit (
            <a href="/guide/what-is-rent-on-solana">rent</a>) so the network keeps it stored. A
            standard SPL token account holds about 0.00204 SOL. That deposit is refundable, but only
            when the account is closed or, in a few cases, when the excess is withdrawn.
          </p>
          <p>
            The rent reduction lowers the <em>minimum</em> deposit for a token account from about
            0.00204 SOL to about 0.00185 SOL. Two things follow:
          </p>
          <ol>
            <li>
              <strong>New token accounts are cheaper.</strong> Any account created after September 3
              locks about 9% less SOL.
            </li>
            <li>
              <strong>Existing accounts now hold more than they need.</strong> Your old accounts
              were not touched. They still contain the full 0.00204 SOL, which is now about 0.00019
              SOL above the new minimum.
            </li>
          </ol>
          <p>
            That second point is where the &ldquo;free SOL&rdquo; headlines come from. Across roughly
            1.16 billion token accounts, that surplus adds up to a lot of SOL. But it does not move
            by itself.
          </p>

          <h2>The part nobody puts in the headline</h2>
          <p>
            The network did not refund anything. The surplus stays inside each account until someone
            explicitly withdraws it. The SPL Token program has an instruction for exactly this (
            <code>WithdrawExcessLamports</code>), but most wallets do not expose it, and most reclaim
            tools do not use it yet.
          </p>
          <p>
            So for an account that still holds tokens, the 9% is real but not yet in your hands.
            Expect wallets and tools, including us, to add this over the coming weeks as the
            remaining steps roll out.
          </p>

          <h2>What it means if your accounts are empty</h2>
          <p>Nothing changed here, and that is the good news.</p>
          <p>
            An empty token account has always returned 100% of its deposit when closed. That was
            true before September 3 and it is true now. If you have empty accounts from old
            airdrops, sold memecoins, or expired NFTs,{' '}
            <a href="/guide/how-to-reclaim-your-sol">closing them</a> still returns the full 0.00204
            SOL each.
          </p>
          <p>
            That is what SolanaSweeper does. Connect nothing, <a href="/">paste your address</a>,
            and the checker shows how many empty accounts you have and what they are worth. If you
            want to close them, connect a wallet and sweep. The SOL returns to you in the same
            transaction.
          </p>

          <h2>What it means for the coming months</h2>
          <p>
            The plan has four more steps. Each one lowers the minimum again and widens the gap
            between what old accounts hold and what they need:
          </p>
          <ul>
            <li>After step 2 (planned for September): existing accounts hold about 27% more than the new minimum.</li>
            <li>After step 5 (late 2026): about 90% more.</li>
          </ul>
          <p>Two practical consequences:</p>
          <ul>
            <li>
              <strong>Newly created accounts will return less when closed.</strong> A token account
              made after all five steps will hold about 0.0002 SOL instead of 0.002. Sweeping those
              will still work, just with smaller numbers.
            </li>
            <li>
              <strong>Accounts created before the reductions become the interesting ones.</strong>{' '}
              Every account you already own keeps its original deposit. The older the account, the
              bigger the surplus relative to today&rsquo;s rules. If you have been on Solana for a
              while, your wallet is sitting on more reclaimable SOL than a new wallet ever will.
            </li>
          </ul>

          <h2>Short version</h2>
          <ul>
            <li>Rent is down 9%, with a 90% cut coming in steps.</li>
            <li>Empty accounts: close them, get 100% of the deposit back. Unchanged.</li>
            <li>
              Accounts with tokens: they now hold a ~9% surplus, but it needs an explicit withdraw.
              Tools are catching up.
            </li>
            <li>
              Old accounts are worth more than new ones. Do not close them out of habit before
              checking what is inside.
            </li>
          </ul>
          <p>
            <a href="/">Check your address</a> on solanasweeper.com. No wallet connection needed for
            the check.
          </p>

          <h2>Sources</h2>
          <ul>
            <li>
              <Ref href="https://solana.com/upgrades/reduced-rent">
                Solana Foundation: reduced rent upgrade tracker
              </Ref>
            </li>
            <li>
              <Ref href="https://github.com/solana-foundation/solana-improvement-documents/pull/437">
                SIMD-0437: Incremental Reduction of <code>lamports_per_byte</code> to 696
              </Ref>
            </li>
            <li>
              <Ref href="https://ambcrypto.com/">
                Solana Floor data via AMBCrypto (September 5, 2026)
              </Ref>
            </li>
          </ul>
        </div>

        {/* CTA terug naar de checker (zelfde patroon als de guide-artikelen) */}
        <aside
          style={{
            marginTop: '48px', padding: '22px 24px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(20,241,149,0.07), rgba(153,69,255,0.07))',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#fff', margin: '0 0 3px' }}>
              See how much SOL you can reclaim
            </p>
            <p style={{ fontFamily: 'General Sans, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Paste any address on solanasweeper.com. No connection needed.
            </p>
          </div>
          <a
            href="/"
            style={{
              flexShrink: 0,
              fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              color: '#05140d', background: 'linear-gradient(135deg, #14F195 0%, #9945FF 150%)',
              padding: '11px 20px', borderRadius: '12px', textDecoration: 'none',
            }}
          >
            Check a wallet
          </a>
        </aside>
      </article>
    </InnerLayout>
  );
}
