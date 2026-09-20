import type { Metadata } from 'next';
import ErrorArticle from '@/components/ErrorArticle';
import { getErrorPage } from '@/lib/errors';

const page = getErrorPage('transaction-simulation-failed')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `/errors/${page.slug}` },
  openGraph: { type: 'article', title: page.title, description: page.description, url: `/errors/${page.slug}` },
  twitter: { card: 'summary_large_image', title: page.title, description: page.description },
};

export default function Page() {
  return (
    <ErrorArticle page={page}>
      <p>
        Before a wallet sends anything, it asks an RPC node to run the transaction against the
        current state of the chain. If that dry run fails, the wallet stops and shows you this. No
        transaction was submitted, no fee was paid, and nothing in your wallet changed.
      </p>

      <h2>Why is this message so unhelpful?</h2>
      <p>
        Because it is a wrapper, not a cause. The actual reason is a program error code returned by
        whichever on-chain program rejected the instruction, and most wallets bury it. You will see
        variations like:
      </p>
      <ul>
        <li><code>Transaction simulation failed: Error processing Instruction 0</code></li>
        <li><code>insufficient funds. simulation failed. err 1</code></li>
        <li><code>Simulation failed. custom program error: 0x1</code></li>
      </ul>
      <p>
        That trailing number is the part that matters. <code>err 1</code> and{' '}
        <code>custom program error: 0x1</code> are the same thing written two ways, one in decimal
        and one in hex.
      </p>

      <h2>How do I find the real error?</h2>
      <p>
        Three places, in order of how quickly they give you an answer.
      </p>
      <p>
        <strong>The wallet itself.</strong> Phantom and Solflare both put the full message behind a
        details or expand control on the rejection dialog. It is usually one click away and people
        rarely look.
      </p>
      <p>
        <strong>The browser console.</strong> Open developer tools before you retry. A simulation
        failure logs the program logs, which name the instruction and the error. This is the most
        reliable route in a browser.
      </p>
      <p>
        <strong>The app you are using.</strong> A well-built app catches the simulation result and
        translates it. If the interface only repeats &ldquo;simulation failed&rdquo; and offers you
        nothing else, that is a quality signal about the app, not about your wallet.
      </p>

      <h2>What do the common codes mean?</h2>
      <p>
        Codes in the <code>0x</code> range come from the token program when the failing instruction
        is a token one. The three you are most likely to hit around token accounts:
      </p>
      <ul>
        <li>
          <code>0x1</code> is InsufficientFunds, and it refers to the token, not your SOL.{' '}
          <a href="/errors/custom-program-error-0x1">What to do about 0x1</a>.
        </li>
        <li>
          <code>0xb</code> is NonNativeHasBalance: you are closing an account that still holds
          something. <a href="/errors/custom-program-error-0xb">What to do about 0xb</a>.
        </li>
        <li>
          <code>0x23</code> is AccountHasWithheldTransferFees, a Token-2022 account with fees parked
          inside it. <a href="/errors/custom-program-error-0x23">What to do about 0x23</a>.
        </li>
      </ul>
      <p>
        A different family of failure shows up as{' '}
        <code>Transaction results in an account with insufficient funds for rent</code>. That one is
        not a program error at all but the runtime refusing to leave an account below its rent
        minimum, and it has{' '}
        <a href="/blog/insufficient-funds-for-rent-solana">its own explanation</a>.
      </p>

      <h2>Is a failed simulation dangerous?</h2>
      <p>
        No, and it is worth understanding why. Simulation runs against a recent snapshot of state
        without signing or submitting anything. A rejection means the network never saw the
        transaction. You have lost nothing except the attempt.
      </p>
      <p>
        The one thing worth checking is whether you were about to sign something you did not
        intend. A simulation failure is a good moment to read the instruction list rather than
        clicking retry.{' '}
        <a href="/guide/is-it-safe">How to read a Solana transaction</a>{' '}covers what to look for.
      </p>

      <h2>It fails, then works on retry. Why?</h2>
      <p>
        Simulation uses a recent blockhash and a recent view of state. If an account changed between
        the moment the app built the transaction and the moment the node simulated it, the dry run
        fails on state that is already stale. Rebuilding the transaction fixes it, which is what a
        retry does.
      </p>
      <p>
        This is common when you are closing many accounts at once and something in the batch moved
        in the meantime. If a retry keeps failing on the same code, it is not a timing problem and
        the code is telling you something real.
      </p>
    </ErrorArticle>
  );
}
