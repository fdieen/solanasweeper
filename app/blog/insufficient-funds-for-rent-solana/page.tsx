import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { getBlog, SITE_URL } from '@/lib/blog';
import { BlogPostSchema } from '@/components/StructuredData';

const article = getBlog('insufficient-funds-for-rent-solana')!;

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

export default function BlogInsufficientFundsForRent() {
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
            Insufficient funds for rent on Solana: what it means and how to fix it
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
            You try to send a token, swap on Jupiter, or mint something, and your wallet throws one
            of these:
          </p>
          <ul>
            <li><code>Insufficient funds for rent</code></li>
            <li><code>Transaction results in an account with insufficient funds for rent</code></li>
            <li><code>InsufficientFundsForRent {'{'} account_index: 0 {'}'}</code></li>
            <li><code>Transfer: insufficient lamports 4569890, need 4600000</code></li>
          </ul>
          <p>
            You <em>do</em> have SOL in the wallet. So what is Solana asking for?
          </p>

          <h2>Rent in one paragraph</h2>
          <p>
            Every account on Solana — including every token account your wallet creates — has to
            hold a minimum SOL balance to stay alive. That minimum is called{' '}
            <a href="/guide/what-is-rent-on-solana">rent</a>. It is not a recurring fee; it is a
            deposit. For a standard token account (165 bytes) the deposit is{' '}
            <strong>0.00203928 SOL</strong>. For your main wallet account it is about{' '}
            <strong>0.00089 SOL</strong>.
          </p>
          <p>
            If a transaction would push any account <em>below</em> its rent minimum, the Solana
            runtime rejects the whole transaction before it touches the chain. That is the error you
            are seeing.
          </p>

          <h2>Why it happens even though you &ldquo;have SOL&rdquo;</h2>
          <p>Three common situations:</p>
          <p>
            <strong>1. Your wallet balance is just above zero.</strong> You have, say, 0.0007 SOL.
            The transaction fee is 0.000005 SOL, but after paying it your wallet would sit below its
            own 0.00089 SOL minimum. Rejected. This is the most frequent cause on mobile wallets
            after a few days of trading.
          </p>
          <p>
            <strong>2. The transaction creates a new token account.</strong> Receiving a token you
            have never held before creates a fresh token account, and that account needs its own
            0.002 SOL deposit. If you have 0.0015 SOL, the swap fails even though the swap itself is
            tiny.
          </p>
          <p>
            <strong>3. A fee or transfer leaves a few lamports short.</strong> The{' '}
            <code>insufficient lamports 4569890, need 4600000</code> variant means a transfer asked
            for more than the account holds — often a fee calculated on a stale balance. Thirty
            thousand lamports (0.00003 SOL) is enough to trigger it.
          </p>

          <h2>How to fix it</h2>
          <p>
            <strong>Option A — top up.</strong> Send 0.01 SOL to the wallet. Boring, but it solves
            all three cases immediately.
          </p>
          <p>
            <strong>Option B — close empty token accounts you already own.</strong> Every token you
            have ever held and later sold or sent away left an empty account behind, each still
            holding its 0.002 SOL deposit. Twenty old meme coins means about 0.04 SOL sitting locked
            in accounts that do nothing. Closing them returns that SOL to your wallet — and closing
            is a normal Solana instruction that any wallet can sign.
          </p>
          <p>
            You can do this from the command line with <code>spl-token close</code>, or use a tool
            like <a href="/">SolanaSweeper</a> that scans your wallet, shows how much is locked, and{' '}
            <a href="/guide/how-to-reclaim-your-sol">closes the empty accounts in one signature</a>.
            You can check any wallet address on the site without connecting to see the number first.
          </p>
          <p>
            <strong>Option C — lower the batch.</strong> If you are doing something in bulk
            (closing, burning, sending), do fewer accounts per transaction. Each close instruction
            adds a little compute, and the fee grows with it.
          </p>

          <h2>A note on Token-2022 accounts</h2>
          <p>
            Some newer tokens use the Token-2022 program with a <em>transfer fee</em> extension.
            When you sell all of such a token, the account balance goes to zero but a small{' '}
            <strong>withheld fee</strong> stays inside the account. Trying to close it gives a
            different error — <code>custom program error: 0x23</code> — and the fix is to harvest the
            withheld amount to the mint first, then close. Good tools do this automatically; if
            yours does not, that is why the close fails.
          </p>

          <h2>Quick checklist</h2>
          <ul>
            <li>Wallet below ~0.001 SOL? Top up or reclaim rent from empty accounts.</li>
            <li>First time receiving a token? You need 0.002 SOL spare for the new account.</li>
            <li>Error mentions <code>0x23</code>? It is a Token-2022 fee account; harvest before closing.</li>
            <li>
              Error persists after a top-up? Refresh the page — the app may be simulating against an
              old balance.
            </li>
          </ul>
          <p>
            Rent is one of the few Solana concepts that catches everyone once. After that it is just
            a deposit you can get back.
          </p>
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
