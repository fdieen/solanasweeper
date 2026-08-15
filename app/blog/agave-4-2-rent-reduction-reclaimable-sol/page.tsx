import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { getBlog, SITE_URL } from '@/lib/blog';

const article = getBlog('agave-4-2-rent-reduction-reclaimable-sol')!;
const url = `${SITE_URL}/blog/${article.slug}`;

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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  datePublished: article.datePublished,
  dateModified: article.datePublished,
  author: { '@type': 'Organization', name: 'SolanaSweeper', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'SolanaSweeper',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  image: `${SITE_URL}/og.png`,
  inLanguage: 'en',
};

const blogBg = `
  radial-gradient(ellipse 70% 45% at 50% 0%, rgba(50,26,95,0.20) 0%, transparent 62%),
  radial-gradient(ellipse 45% 34% at 8% 5%, rgba(153,69,255,0.14) 0%, transparent 55%),
  radial-gradient(ellipse 44% 30% at 94% 8%, rgba(20,241,149,0.08) 0%, transparent 55%)
`;

// Externe referentie-link: nieuw tabblad + veilige rel (zoals gevraagd).
function Ref({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function BlogAgaveRentReduction() {
  return (
    <InnerLayout bg={blogBg}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            What does the Agave 4.2 rent reduction mean for my locked SOL?
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
            <time dateTime={article.datePublished}>July 31, 2026</time>
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
            Solana is in the middle of a staged reduction of <code>lamports_per_byte</code>, the
            constant that determines how much SOL you have to lock up to open an on-chain account.
            The headline number moving around the ecosystem is a 90% cut. The number is real. The
            way most people are reading it is not.
          </p>
          <p>
            The short version: <strong>the SOL currently sitting in your existing token accounts is
            unaffected.</strong> If you have a wallet full of empty accounts from tokens you traded
            years ago, that rent is still worth what it has always been worth. What changes is the
            price of opening <em>new</em> accounts from here on.
          </p>
          <p>This page explains the mechanism, the schedule, and the actual math.</p>

          <h2>What rent is</h2>
          <p>
            <a href="/guide/what-is-rent-on-solana">Rent on Solana</a> is not a recurring fee. It is a refundable deposit. When an account is
            created, it has to hold a minimum lamport balance to be rent-exempt — this is the
            network&rsquo;s way of pricing permanent state storage. Close the account, and every
            lamport in it comes back to you.
          </p>
          <p>The minimum is calculated as:</p>
          <pre>
            <code>{`effective_size = ACCOUNT_STORAGE_OVERHEAD + data_size_bytes
min_balance    = effective_size × lamports_per_byte`}</code>
          </pre>
          <p>
            For a standard SPL token account (an &ldquo;ATA&rdquo;): 165 bytes of data plus 128
            bytes of storage overhead = 293 bytes. At the current <code>lamports_per_byte</code> of
            6,960, that is <strong>2,039,280 lamports — 0.00203928 SOL</strong> locked per account.
          </p>
          <p>
            Every token you have ever received, airdropped or traded created one of these. Most
            people have dozens. Some have hundreds.
          </p>

          <h2>What is actually changing</h2>
          <p>
            SIMD-0437 reduces <code>lamports_per_byte</code> from 6,960 down to 696 — a 10x
            reduction — but it does so <strong>in five separate feature-gated steps</strong>, not in
            one activation:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th><code>lamports_per_byte</code></th>
                  <th>ATA rent</th>
                  <th>Reduction from today</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Today</td><td>6,960</td><td>0.00203928 SOL</td><td>—</td></tr>
                <tr><td>1</td><td>6,333</td><td>0.00185557 SOL</td><td>9%</td></tr>
                <tr><td>2</td><td>5,080</td><td>0.00148844 SOL</td><td>27%</td></tr>
                <tr><td>3</td><td>2,575</td><td>0.00075448 SOL</td><td>63%</td></tr>
                <tr><td>4</td><td>1,322</td><td>0.00038735 SOL</td><td>81%</td></tr>
                <tr><td>5</td><td>696</td><td>0.00020393 SOL</td><td>90%</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Anza&rsquo;s Agave v4.2 schedule targets the <strong>first</strong> of these steps for
            mainnet activation on <strong>August 17, 2026</strong>, alongside 200ms slot times and
            larger transaction sizes; Anza labels this a provisional schedule. Each subsequent step
            is gated behind its own activation and requires an explicit risk assessment — the concern
            being that cheaper state means faster state growth, which is the thing validators have to
            carry.
          </p>
          <p>
            There is no published date for steps two through five. Treat the full 10x as a
            multi-stage process measured in quarters, not weeks.
          </p>

          <h2>Why your existing accounts are not repriced</h2>
          <p>This is the part that gets lost.</p>
          <p>
            <code>lamports_per_byte</code> sets the <em>minimum balance required</em> for an account
            to be rent-exempt. It does not reach into accounts that already exist and remove lamports
            from them. An SPL token account does not store a &ldquo;rent reserve&rdquo; field that
            gets recalculated — it simply has a lamport balance, and that balance was funded at
            creation time under the old constant.
          </p>
          <p>
            When you close a token account, the SPL Token program&rsquo;s <code>CloseAccount</code>{' '}
            instruction transfers <strong>the entire lamport balance</strong> of that account to a
            destination you specify. Not the current minimum. Not the new minimum. All of it.
          </p>
          <p>
            So an ATA created in 2023, 2025 or last Tuesday holds 2,039,280 lamports, and closing it
            returns 2,039,280 lamports — before, during and after every step of the reduction
            schedule.
          </p>
          <p>
            What the reduction changes is the cost of the <em>next</em> account you open. After full
            activation, a new ATA locks roughly 0.0002 SOL instead of 0.002 SOL. Cheap enough that
            applications can plausibly cover it on behalf of their users, which is the entire point
            of the change.
          </p>

          <h2>The practical consequence</h2>
          <p>Two things follow from this, and they point in opposite directions.</p>
          <p>
            <strong>Nothing is expiring.</strong> There is no deadline, no cliff, and no urgency
            created by this upgrade for anyone holding old accounts. Anyone telling you to reclaim
            your rent <em>before the reduction hits</em> has the mechanism backwards. Your SOL is not
            going anywhere.
          </p>
          <p>
            <strong>But the pool stops growing.</strong> Once the schedule completes, newly created
            accounts lock 10x less. The large-deposit accounts sitting in wallets across Solana are a
            legacy stock — finite, created under the old pricing, and not being replenished at the
            same value. The aggregate amount of SOL recoverable from account closures gets smaller
            over time, not because existing accounts lose value, but because the accounts created
            after activation are worth a tenth as much when closed.
          </p>
          <p>
            If you have never swept your wallet, the amount you can recover today is as high as it
            will ever be. Not because of a deadline — because of arithmetic.
          </p>

          <h2>Check what you&rsquo;re holding</h2>
          <p>
            You can see exactly how many empty token accounts are sitting in your wallet, and how
            much SOL they have locked, without connecting anything.{' '}
            <a href="/">SolanaSweeper&rsquo;s checker</a> reads public on-chain state from a wallet
            address alone — paste it in, get the number.
          </p>
          <p>
            If you decide to <a href="/guide/how-to-reclaim-your-sol">reclaim it</a>, closing is non-custodial and happens in a transaction you
            sign yourself. Your tokens are never transferred, only empty accounts are closed, and the
            rent goes directly back to your wallet.
          </p>

          <h2>References</h2>
          <ul>
            <li>
              <Ref href="https://github.com/anza-xyz/agave/wiki/v4.2-Release-Schedule">
                Anza: Agave v4.2 Release Schedule
              </Ref>
            </li>
            <li>
              <Ref href="https://github.com/solana-foundation/solana-improvement-documents/pull/437">
                SIMD-0437: Incremental Reduction of <code>lamports_per_byte</code> to 696
              </Ref>
            </li>
            <li>
              <Ref href="https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0436-reduce-rent-exempt-minimum-by-2x.md">
                SIMD-0436: Reduce Rent-Exempt Minimum by 2x
              </Ref>
            </li>
            <li>
              <Ref href="https://solana.com/news/solana-network-upgrades">Solana Network Upgrades</Ref>
            </li>
            <li>
              <Ref href="https://docs.anza.xyz/implemented-proposals/rent">Anza: Rent documentation</Ref>
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
