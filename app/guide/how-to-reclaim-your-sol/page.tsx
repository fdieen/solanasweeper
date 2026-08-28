import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('how-to-reclaim-your-sol')!;

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.keywords,
  alternates: { canonical: `/guide/${article.slug}` },
  openGraph: { type: 'article', title: article.title, description: article.description, url: `/guide/${article.slug}` },
  twitter: { card: 'summary_large_image', title: article.title, description: article.description },
};

// richProse: dit artikel heeft CLI-codeblokken; die styling zit in .blog-prose.
export default function Page() {
  return (
    <GuideArticle article={article} richProse>
      <p>
        Closing a token account is one instruction. Getting a hundred of them closed is a logistics
        problem, and that is really what separates the three approaches below.
      </p>
      <p>
        All of them do the same thing at the protocol level: they call <code>CloseAccount</code> in
        the SPL Token program, which transfers the account&apos;s entire lamport balance to a
        destination you choose and removes the account from state. What differs is how much work you
        do, how much you pay, and how much you have to trust someone else.
      </p>

      <h2>Can I do it myself with the Solana CLI?</h2>
      <p>
        Yes, and it costs nothing beyond transaction fees. If you are comfortable in a terminal this
        is the most direct route, with no intermediary at all.
      </p>
      <p>Start by listing what you have:</p>
      <pre>
        <code>{`spl-token accounts`}</code>
      </pre>
      <p>
        That prints every token account your wallet owns, with balances. The ones showing zero are
        your candidates.
      </p>
      <p>To see what a given account is holding in rent:</p>
      <pre>
        <code>{`solana rent 165`}</code>
      </pre>
      <p>
        165 is the byte size of a standard token account, and the command prints the rent-exempt
        minimum for that size.
      </p>
      <p>To close a specific account:</p>
      <pre>
        <code>{`spl-token close --address <TOKEN_ACCOUNT_ADDRESS>`}</code>
      </pre>
      <p>
        And to sweep the obvious cases in one go, the SPL toolchain has a garbage-collect command
        that closes empty accounts you are the close authority on:
      </p>
      <pre>
        <code>{`spl-token gc`}</code>
      </pre>
      <p>
        Run <code>spl-token close --help</code> and <code>spl-token gc --help</code> before you use
        either in anger — the flags change between versions, and you want to know what your version
        does rather than what a guide from two years ago said it did.
      </p>
      <p>
        The honest downsides: you need the Solana CLI installed and a keypair configured, which
        means your private key sits in a file on your machine. That is a different risk profile from
        a browser wallet, not automatically a better one. And <code>gc</code> handles the
        straightforward cases — accounts with leftover dust, and{' '}
        <a href="/guide/what-you-cant-reclaim">the other accounts that will not close</a>, still
        need dealing with first.
      </p>

      <h2>Can my wallet do it?</h2>
      <p>
        Sometimes. A few wallets have added account cleanup as a built-in feature, and when your
        wallet offers it, that is the lowest-friction option available: no new site to trust, no new
        permissions, and the wallet already holds your keys.
      </p>
      <p>
        Coverage is the catch. Support is inconsistent between wallets and between versions, the
        feature is often limited to plain empty SPL accounts, and Token-2022 accounts or anything
        with dust in it typically falls outside what the built-in flow handles. It is worth checking
        whether your wallet has it before looking further — you may not need a third party at all.
      </p>

      <h2>What does a wallet cleaner add?</h2>
      <p>Two things: it finds the accounts, and it batches them.</p>
      <p>
        Finding is the boring part but it matters. A cleaner reads every token account your wallet
        owns, checks each one&apos;s actual lamport balance rather than assuming the standard
        figure, and works out which are genuinely closeable and which are exceptions. Doing that by
        hand across a hundred accounts is where people make mistakes.
      </p>
      <p>
        Batching is where the real work is. A Solana transaction has a size limit, and every close
        instruction takes up room. Legacy and v0 transactions cap at 1,232 bytes, which in practice
        means somewhere in the region of twenty-odd close instructions per transaction depending on
        what else is in there. SIMD-0296 introduces a new v1 transaction format that raises the
        ceiling to 4,096 bytes, but v0 and legacy transactions keep the old limit — so the number of
        signatures you need depends on which format the tool builds.
      </p>
      <p>
        That is the practical difference between tools. A wallet with two hundred empty accounts is
        ten-ish signatures with good batching and forty with bad batching, for identical results.
      </p>
      <p>
        What they cost varies a lot. Fees in this category run from around 2% of the recovered SOL
        at the low end to 20% at the high end, usually taken from the reclaimed amount rather than
        charged up front. SolanaSweeper takes 10%. We are not the cheapest and we do not pretend to
        be — what we compete on is that you can check a wallet without connecting it, and that we do
        not operate our own smart contract. Whether that trade is worth it to you is a reasonable
        thing to weigh.
      </p>

      <h2>Which one should I use?</h2>
      <p>
        If you have a handful of accounts and a terminal, use the CLI. The amounts involved rarely
        justify anything more.
      </p>
      <p>If your wallet has the feature built in, use that. Fewer parties, no fee.</p>
      <p>
        If you have dozens or hundreds of accounts, or a mix of Token-2022 and dust, a cleaner earns
        its fee in saved signatures and avoided mistakes — provided you have checked it properly
        first.
      </p>

      <h2>What should I check before using any tool?</h2>
      <p>Four things, and they take a minute.</p>
      <ul>
        <li>
          <strong>The URL.</strong>{' '}Type it or use a bookmark. Do not arrive from an ad, a search
          result you did not read carefully, or a link in a message. Cloned cleaner sites exist
          specifically because this audience is about to sign transactions. It is the first of{' '}
          <a href="/guide/common-mistakes">the mistakes that cost people SOL</a>.
        </li>
        <li>
          <strong>Whether it asks for a seed phrase.</strong>{' '}Nothing legitimate ever needs one.
          This is not a judgement call — a request for a seed phrase means close the tab.
        </li>
        <li>
          <strong>What the transaction actually contains.</strong>{' '}Your wallet shows you the
          instructions before you sign. <code>CloseAccount</code> is what you want to see.{' '}
          <code>SetAuthority</code> on your accounts is not.{' '}
          <a href="/guide/is-it-safe">What you are actually signing</a>{' '}goes through this
          properly.
        </li>
        <li>
          <strong>Whether you can see the number without connecting.</strong>{' '}Reading balances is
          public on-chain data and requires no wallet connection. A tool that demands a connection
          just to show you a figure is asking for more than the task needs.
        </li>
      </ul>

      {/* Zichtbaar FAQ-blok, bewust ZONDER FAQPage-schema: dat staat alleen op /faq. */}
      <h2>Frequently asked questions</h2>

      <h3>Do I need SOL in my wallet to close accounts?</h3>
      <p>
        Yes, a small amount for transaction fees — roughly 0.000005 SOL per signature. If your
        wallet is completely empty you cannot sign anything, which is an awkward but real
        chicken-and-egg problem.
      </p>

      <h3>Where does the reclaimed SOL go?</h3>
      <p>
        To a destination the close instruction specifies. Note that this is not automatically
        whoever paid to create the account originally — the signer chooses. Any tool acting on your
        behalf should be sending it to your own wallet, and you can verify that in the transaction
        before signing.
      </p>

      <h3>Can I close an account someone else created for me?</h3>
      <p>
        If you are the account owner, yes. Ownership is what the close instruction checks, not who
        paid for the account&apos;s creation.
      </p>

      <h3>Is there a deadline?</h3>
      <p>
        No. Rent-exempt accounts persist indefinitely and the deposit does not expire. See{' '}
        <a href="/guide/what-is-rent-on-solana">what rent actually is</a>{' '}for why.
      </p>
    </GuideArticle>
  );
}
