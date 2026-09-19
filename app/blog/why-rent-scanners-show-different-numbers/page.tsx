import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import { getBlog, SITE_URL } from '@/lib/blog';
import { BlogPostSchema } from '@/components/StructuredData';

const article = getBlog('why-rent-scanners-show-different-numbers')!;

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

export default function BlogWhyRentScannersDiffer() {
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
            Why two rent scanners give you different numbers for the same wallet
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
            <time dateTime={article.datePublished}>September 19, 2026</time>
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

        <div className="guide-prose blog-prose">
          <p>
            Paste the same wallet into two rent tools and you get two totals. One says 0.73 SOL, the
            other says 0.71. People read that as proof that one of them is lying, and occasionally
            that is true, but the ordinary explanation is duller: the two are answering slightly
            different questions.
          </p>

          <h2>Reclaimable is an estimate, not a balance</h2>
          <p>
            The rent in your token accounts is not in dispute. It is on-chain, anyone can read it,
            and a standard SPL token account holds <strong>0.00203928 SOL</strong>. What varies is
            the judgement call on top of it: which of your accounts will actually close, today, in a
            transaction you could sign right now.
          </p>
          <p>
            That is a prediction, and every tool draws the line somewhere slightly different. Here
            is where.
          </p>

          <h2>1. Dust accounts</h2>
          <p>
            The biggest single cause. An account holding 0.0000001 of some dead token still holds
            its full rent deposit, but the close instruction requires a zero balance, so it will not
            close until that fraction is burned or swapped away.
          </p>
          <p>
            A scanner that counts those accounts is right about the rent and wrong about what lands
            in your wallet today. A scanner that excludes them is right about today and quietly
            hides SOL you could get with one extra step. Both are defensible.{' '}
            <a href="/guide/burn-or-swap-dust">Burn or swap</a>{' '}covers which extra step is worth
            taking.
          </p>

          <h2>2. Frozen accounts</h2>
          <p>
            Widely stated wrongly, including by us. A frozen account <em>can</em> be closed, as long
            as its token balance is zero. Freezing blocks transfers and burns, not the close
            instruction.
          </p>
          <p>
            So frozen and empty is reclaimable. Frozen with a balance is genuinely stuck, because
            you cannot clear the balance to reach zero. A tool that excludes every frozen account
            reports a lower number than one that checks the balance first. SolanaSweeper currently
            skips all frozen accounts, which is the conservative side of that line and means our
            estimate can come in under a competitor&apos;s without either being wrong.
          </p>

          <h2>3. Token program coverage</h2>
          <p>
            There are two token programs on Solana, the original SPL Token program and Token-2022. A
            wallet that has been active since 2021 usually has accounts under both, and a scanner
            that queries only the first silently misses the rest.
          </p>
          <p>
            Token-2022 adds a second trap. A mint can carry a transfer fee extension, and when you
            sell out of such a token the balance reads zero while a withheld fee stays inside the
            account. Closing it fails with <code>custom program error: 0x23</code> until the
            withheld amount is harvested to the mint. A tool that does not harvest first will list
            the account as reclaimable and then fail on it.
          </p>

          <h2>4. Metadata accounts</h2>
          <p>
            An NFT is two accounts: the token account and a separate metadata account, each with its
            own rent. They are closed by different instructions in different programs.
          </p>
          <p>
            A tool that only closes token accounts recovers the smaller half and leaves the metadata
            rent behind. A tool that does both reports a higher number for the same wallet. Again,
            both are counting honestly, they are just counting different things.
          </p>

          <h2>5. Compressed NFTs</h2>
          <p>
            This one has a right answer. Compressed NFTs do not live in individual accounts; they
            are leaves in a Merkle tree, with one on-chain account covering thousands of items.
            There is no per-item rent deposit, so there is nothing to reclaim.
          </p>
          <p>
            Any tool advertising meaningful SOL recovery from compressed NFTs is either confused or
            counting on you not checking. The arithmetic does not exist.
          </p>

          <h2>6. Gross versus net</h2>
          <p>
            The most boring reason and probably the most common. One tool shows the rent that comes
            out of the accounts, the other shows what reaches your wallet after its fee. Comparing
            those two is comparing a price before tax with a price after it.
          </p>
          <p>
            A worked example: a 0.0186 SOL gap between two tools is about nine accounts at 0.00204,
            which points at scope. A gap that is a clean percentage of the total, on the other hand,
            is a fee, not a disagreement about your wallet.
          </p>

          <h2>7. New in 2026: not every account holds the same rent</h2>
          <p>
            Rent is being cut in steps. The rent-exempt minimum has already dropped from 6,960 to
            6,333 lamports per byte, which takes a new token account from about 0.00204 SOL to about
            0.00185 SOL, with further steps to come.
          </p>
          <p>
            Accounts opened before the change still hold the old amount, and closing one still
            returns the full 0.00204. So a scanner that multiplies your account count by a
            hardcoded constant will drift from one that reads the actual lamports per account, and
            that drift grows with every step.{' '}
            <a href="/blog/solana-rent-reduction-live-what-it-means">The rent cut</a>{' '}has the
            details.
          </p>

          <h2>How to settle it in ten seconds</h2>
          <p>
            Ignore both headline numbers and read the transaction preview. Your wallet shows the
            instruction list before you sign: count the closes, multiply by the rent, subtract the
            stated fee. That number is not an opinion, and it is the only one that has to be right.
          </p>
          <p>
            If a tool will not show you what it is about to sign, that is the finding, not the
            total.{' '}
            <a href="/guide/is-it-safe">How to read the transaction</a>{' '}walks through the four
            instructions worth recognising.
          </p>

          <h2>The short version</h2>
          <ul>
            <li>Dust accounts hold rent but will not close until emptied.</li>
            <li>Frozen and empty closes fine. Frozen with a balance does not.</li>
            <li>Missing Token-2022 accounts means missing rent.</li>
            <li>NFT metadata rent is a separate account and a separate instruction.</li>
            <li>Compressed NFTs hold no reclaimable rent at all.</li>
            <li>Check whether you are comparing before-fee with after-fee.</li>
            <li>Old accounts hold more rent than new ones, and that gap is widening.</li>
          </ul>
          <p>
            Two tools disagreeing is normal. A tool that cannot explain <em>why</em> it disagrees is
            the one to be careful with.
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
