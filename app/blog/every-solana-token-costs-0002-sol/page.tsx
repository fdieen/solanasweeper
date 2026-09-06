import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { getBlog, SITE_URL } from '@/lib/blog';
import { BlogPostSchema } from '@/components/StructuredData';

const article = getBlog('every-solana-token-costs-0002-sol')!;

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

export default function BlogEveryTokenCostsRent() {
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
            Why every Solana token you ever held costs you 0.002 SOL
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
            Here is a number most Solana users never look at: <strong>0.00203928 SOL</strong>.
          </p>
          <p>
            That is what your wallet pays, silently, the first time it receives any new token. Not
            to the sender, not to a DEX — to the network, as a deposit on a small piece of storage
            called a <em>token account</em>. You get it back only if you close the account. Almost
            nobody does.
          </p>

          <h2>What a token account is</h2>
          <p>
            Your wallet address holds SOL directly. It cannot hold tokens directly. For every
            distinct token (BONK, USDC, that thing from the group chat), Solana creates a separate
            165-byte account owned by your wallet that tracks the balance for that one token. That
            account must hold a <a href="/guide/what-is-rent-on-solana">rent-exempt minimum</a> of
            0.002 SOL for as long as it exists.
          </p>
          <p>
            Sell the token, send it away, watch it go to zero — the account stays. Balance zero,
            deposit still locked.
          </p>

          <h2>How it adds up</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tokens ever held</th>
                  <th>SOL locked</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>10</td><td>0.02</td></tr>
                <tr><td>50</td><td>0.10</td></tr>
                <tr><td>200</td><td>0.41</td></tr>
                <tr><td>1,000</td><td>2.04</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            The numbers on the right are what a wallet is holding <em>hostage</em>, not what it is
            worth. Someone who airdrop-farmed for a season can easily be at the bottom of that table
            without ever noticing, because no wallet UI shows rent as a line item.
          </p>
          <p>
            One real example from last weekend: a single wallet closed roughly 1,300 empty token
            accounts in one sitting and recovered about 2.6 SOL. The tokens were long gone; the
            deposits were not.
          </p>

          <h2>How to see your number</h2>
          <p>
            You do not need to connect anything. Paste any wallet address into{' '}
            <a href="/">the checker on solanasweeper.com</a> and it lists the empty token accounts
            and the total SOL sitting in them. If you prefer the command line:
          </p>
          <pre>
            <code>{`spl-token accounts --owner <YOUR_WALLET>`}</code>
          </pre>
          <p>Every line with a zero balance is 0.002 SOL waiting.</p>

          <h2>How to get it back</h2>
          <p>
            Closing a token account is a standard instruction in the SPL Token program (
            <code>CloseAccount</code>). It requires:
          </p>
          <ul>
            <li>the account balance to be exactly zero, and</li>
            <li>your signature as the owner.</li>
          </ul>
          <p>
            The rent goes back to your wallet in the same transaction. Nothing is burned, nothing is
            transferred to anyone else, and the account can be recreated later for free if you ever
            receive that token again.
          </p>
          <p>Two things to know before you do it in bulk:</p>
          <p>
            <strong>Token-2022 accounts may need one extra step.</strong> Tokens with a transfer fee
            keep a small <em>withheld</em> amount inside the account even at zero balance. Those
            accounts fail to close with <code>custom program error: 0x23</code> until the withheld
            fee is harvested to the mint first. A good sweeper adds that instruction automatically.
          </p>
          <p>
            <strong>Dust is not empty.</strong> An account with a few raw units of a token is not
            closable. Selling manually usually fails because the amount is below the DEX minimum.
            Fun Mode on SolanaSweeper only touches truly empty accounts; Pro Mode swaps the dust
            into SOL first (via Jupiter), and the account is closed on the next sweep once it is
            empty — so you get the dust value <em>and</em>{' '}
            <a href="/guide/how-to-reclaim-your-sol">the rent back</a>.
          </p>

          <h2>Why this matters more than it looks</h2>
          <p>
            0.002 SOL is small. But it compounds with the one behaviour Solana rewards most — trying
            lots of things. Every airdrop claimed, every meme coin tested, every NFT collection
            minted leaves a deposit behind. The more active you are, the more of your own SOL you
            have parked in accounts that do nothing.
          </p>
          <p>
            It is the closest thing Solana has to a free lunch: money that is already yours, sitting
            one signature away.
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
