import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('what-is-rent-on-solana')!;

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.keywords,
  alternates: { canonical: `/guide/${article.slug}` },
  openGraph: { type: 'article', title: article.title, description: article.description, url: `/guide/${article.slug}` },
  twitter: { card: 'summary_large_image', title: article.title, description: article.description },
};

// richProse: dit artikel heeft een tabel en drie codeblokken; die styling zit in
// .blog-prose en staat standaard uit op guide-pagina's.
export default function Page() {
  return (
    <GuideArticle article={article} richProse>
      <p>
        Rent is the small amount of SOL that every Solana account holds in order to stay
        on-chain. It is not a fee you pay over time, and nobody takes it from you. It is a
        deposit. As long as the account exists, the SOL sits there and cannot be spent. When the
        account is closed, the deposit is returned in full to whoever owns it.
      </p>
      <p>
        Most people never notice this until they look. Then they find that a wallet they have used
        for a couple of years is quietly holding a few tenths of a SOL across dozens of accounts
        they forgot they ever created.
      </p>

      <h2>Why does Solana charge rent?</h2>
      <p>
        Every account on Solana lives in validator memory. Thousands of machines around the world
        each keep a copy of the entire account state so that any of them can validate a transaction
        instantly. That storage is not free, and without a cost attached to it there would be
        nothing stopping anyone from creating millions of empty accounts and bloating the state for
        everybody.
      </p>
      <p>
        Rent is the mechanism that puts a price on that space. Early in Solana&apos;s history it
        worked like actual rent: accounts were charged periodically and could be deleted if their
        balance ran out. That model was retired. Today every account must be{' '}
        <strong>rent-exempt</strong> from the moment it is created, meaning it holds enough SOL up
        front to cover its storage permanently. No recurring charge, no risk of your account being
        wiped for non-payment.
      </p>
      <p>
        The word &ldquo;rent&rdquo; stuck, which is why the concept confuses people. Nothing is
        being charged. Something is being held.
      </p>

      <h2>How is rent actually calculated?</h2>
      <p>
        The amount depends on one thing: how many bytes the account occupies. The formula is
      </p>
      <pre>
        <code>{`rent-exempt minimum = (128 + data size in bytes) × 6,960 lamports`}</code>
      </pre>
      <p>
        The 128 bytes are fixed overhead that every account carries regardless of what it stores. A
        lamport is one billionth of a SOL.
      </p>
      <p>A standard SPL token account holds 165 bytes of data, so:</p>
      <pre>
        <code>{`(128 + 165) × 6,960 = 2,039,280 lamports = 0.00203928 SOL`}</code>
      </pre>
      <p>
        That number — roughly two thousandths of a SOL — is the figure to remember. It is what every
        ordinary token account in your wallet is holding.
      </p>
      <p>You can check any size yourself with the Solana CLI:</p>
      <pre>
        <code>{`solana rent 165`}</code>
      </pre>
      <p>which prints the rent-exempt minimum for an account of that size.</p>

      <h2>How many token accounts do I have?</h2>
      <p>
        Almost certainly more than you think, because you rarely create them deliberately.
      </p>
      <p>
        Solana does not track your token balances inside your wallet. It creates a separate account
        for every distinct token you hold — an Associated Token Account, or ATA. Buy a token on a
        DEX and an ATA is created. Receive an airdrop and an ATA is created, whether you wanted the
        token or not. Mint an NFT, get paid in a stablecoin, try a new protocol: each one leaves an
        account behind.
      </p>
      <p>
        Selling the token empties the account. It does not remove it. The ATA stays on-chain at zero
        balance, still holding its 0.00203928 SOL deposit, indefinitely.
      </p>
      <p>
        This is why the number climbs so quietly. An active wallet from a busy market cycle can
        easily carry a hundred or more of these, most of them empty, many of them for tokens the
        owner does not remember touching.
      </p>

      <h2>How much does it add up to?</h2>
      <p>At 0.00203928 SOL per account:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Empty accounts</th>
              <th>Locked SOL</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>5</td><td>0.0102</td></tr>
            <tr><td>20</td><td>0.0408</td></tr>
            <tr><td>50</td><td>0.1020</td></tr>
            <tr><td>100</td><td>0.2039</td></tr>
            <tr><td>500</td><td>1.0196</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        For a casual wallet this is small change. For someone who traded actively through an airdrop
        season, or who runs several wallets, it adds up to a real amount — and it has been sitting
        there doing nothing the entire time.
      </p>
      <p>
        Closing an account costs a transaction fee, currently around 0.000005 SOL per signature.
        Against a 0.00203928 SOL recovery that is under a third of one percent, so the economics are
        never in question. What matters is how many accounts you can close per transaction, not
        whether closing is worth it.
      </p>

      <h2>Do Token-2022 accounts hold more rent?</h2>
      <p>Yes, and this trips people up.</p>
      <p>
        Token-2022 is the newer token program, and it supports extensions: transfer fees, interest
        accrual, transfer hooks, immutable ownership, confidential balances. Each extension an
        account enables makes that account larger, and rent scales directly with size. A Token-2022
        account with several extensions can hold noticeably more than the standard 0.00203928 SOL.
      </p>
      <p>
        The practical consequence is that you cannot estimate your total by counting accounts and
        multiplying. Two wallets with the same number of accounts can hold different amounts. Any
        tool worth using reads the actual lamport balance of each account rather than assuming the
        standard figure.
      </p>

      <h2>Is the rent amount changing?</h2>
      <p>
        It is, and this is worth understanding properly because it is widely misreported.
      </p>
      <p>
        Under{' '}
        <a
          href="https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0437-incremental-rent-reduction.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          SIMD-0437
        </a>
        , Solana is reducing the <code>lamports_per_byte</code> constant from 6,960 to 696 — a
        tenfold cut — spread across five separate steps: 6,960 → 6,333 → 5,080 → 2,575 → 1,322 →
        696. Each step sits behind its own feature gate and only advances when analysis says it is
        safe, so the rollout runs over quarters rather than weeks. The first step was scheduled for
        the week of 17 August 2026.
      </p>
      <p>Two things follow from this, and only the second one is intuitive.</p>
      <p>
        <strong>Your existing accounts are not repriced.</strong>{' '}The SOL already locked in your
        token accounts stays exactly where it is. When you close one of those accounts you recover
        its full lamport balance as it stands today, whatever the current constant happens to be.
        Nothing expires and there is no deadline.
      </p>
      <p>
        <strong>New accounts created after each step will hold less.</strong>{' '}Once the reduction
        is fully live, a new token account will lock roughly 0.000204 SOL instead of 0.00203928 — a
        tenth of what it costs today.
      </p>
      <p>
        Put together: the accounts sitting in your wallet right now hold more rent than any account
        created after the rollout completes. Not because of any urgency, but simply because they
        were created under the old constant. Run <code>solana rent 165</code> at any time to see
        what the current figure is.
      </p>
      <p>
        We went through the details in{' '}
        <a href="/blog/agave-4-2-rent-reduction-reclaimable-sol">the Agave 4.2 rent reduction
        post</a>.
      </p>

      <h2>How do I get my rent back?</h2>
      <p>
        You close the account. Closing an empty token account is a standard, single instruction in
        the SPL Token program — <code>CloseAccount</code> — that has existed since the beginning. It
        returns the account&apos;s entire lamport balance to a destination you choose and removes
        the account from state.
      </p>
      <p>
        There are three practical routes: the Solana CLI, a wallet that offers the feature, or a
        dedicated cleaner that batches many accounts into as few transactions as possible. Each has
        different trade-offs, and we compare them properly in{' '}
        <a href="/guide/how-to-reclaim-your-sol">the three ways to close token accounts</a>.
      </p>
      <p>
        Whichever route you take, the rules are the same. The account must hold zero tokens before
        it can be closed, and only the account&apos;s owner can authorise it — which is why any tool
        doing this needs a signature from you and cannot act on its own. If you are weighing up
        whether a given tool is trustworthy,{' '}
        <a href="/guide/is-it-safe">what you are actually signing</a>{' '}walks through how to check.
      </p>

      <h2>What can&apos;t you reclaim?</h2>
      <p>Not every account in your wallet is a candidate.</p>
      <p>
        Accounts still holding tokens cannot be closed until the balance is zero, so dust has to be
        swapped or burned first. Accounts that are frozen by the token&apos;s issuer cannot be
        touched at all. Some protocol positions look like idle accounts but are in use, and closing
        them would break something. And a handful of accounts, including compressed NFTs, do not
        carry per-account rent in the first place, so there is nothing to recover.
      </p>
      <p>
        The full list, and how to recognise each case, is in{' '}
        <a href="/guide/what-you-cant-reclaim">what you can&apos;t reclaim</a>.
      </p>

      <h2>Is reclaimed rent free money?</h2>
      <p>No, and the framing matters.</p>
      <p>
        It was always your SOL. It was locked as a deposit against storage you were using, and
        closing the account releases it because you are no longer using that storage. Nobody is
        giving you anything and nothing is being generated. You are ending a deposit.
      </p>
      <p>
        That distinction is worth holding onto, because &ldquo;free SOL&rdquo; is the language used
        by a significant number of scam sites in this category. A legitimate tool tells you it is
        returning your own deposit and shows you exactly what you are signing. A tool promising free
        money is selling you something else.
      </p>
      <p>
        It is also why the amounts are what they are. Reclaiming rent from a hundred accounts
        recovers about 0.2 SOL. That is worth doing, and it is not a windfall. Anyone advertising it
        as one is either confused or hoping you are. Believing them is one of{' '}
        <a href="/guide/common-mistakes">the mistakes that cost people SOL</a>.
      </p>

      {/* Zichtbaar FAQ-blok, bewust ZONDER FAQPage-schema: dat staat alleen op /faq. */}
      <h2>Frequently asked questions</h2>

      <h3>Will closing a token account delete my tokens?</h3>
      <p>
        No. An account must hold zero tokens before it can be closed. If it still holds a balance,
        the close instruction fails. Tokens are never destroyed by closing.
      </p>

      <h3>What happens if someone sends me that token again later?</h3>
      <p>
        A new token account is created automatically, with a fresh rent deposit. Nothing is lost —
        you simply hold that token again, in a new account, and can close it again when it is empty.
      </p>

      <h3>Can I check how much I have locked without connecting a wallet?</h3>
      <p>
        Yes. Reading account balances is public on-chain data and needs no signature or connection.
        Any tool that requires a wallet connection just to show you the number is asking for more
        than the task needs.
      </p>

      <h3>Does the SOL disappear if I never close the accounts?</h3>
      <p>
        No. Rent-exempt accounts are permanent. The deposit stays locked for as long as the account
        exists, with no expiry and no risk of loss. It is simply unavailable to you until you close
        it.
      </p>
    </GuideArticle>
  );
}
