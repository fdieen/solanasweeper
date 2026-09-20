import type { Metadata } from 'next';
import ErrorArticle from '@/components/ErrorArticle';
import { getErrorPage } from '@/lib/errors';

const page = getErrorPage('custom-program-error-0x1')!;

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
        In the token program, error 1 is <code>InsufficientFunds</code>, documented as
        &ldquo;insufficient funds for the operation requested&rdquo;. Your wallet may show it as{' '}
        <code>0x1</code>, as <code>err 1</code>, or simply as &ldquo;insufficient funds&rdquo;
        alongside a simulation failure. Same error, three spellings.
      </p>

      <h2>Why does it say insufficient funds when I have SOL?</h2>
      <p>
        Because the program reporting the error is the token program, and the funds it is talking
        about are the token being moved. It is saying the source account does not hold as much of
        that token as the instruction is trying to transfer, burn or swap.
      </p>
      <p>
        Your SOL balance is not what ran out, which is why topping up the wallet does not clear it.
        If adding SOL <em>did</em> fix your problem, you were hitting the rent error instead, which
        is{' '}
        <a href="/blog/insufficient-funds-for-rent-solana">a different failure with a similar name</a>.
      </p>

      <h2>What usually causes it?</h2>
      <p>
        <strong>A stale balance.</strong> The app read your balance, you sold or moved some in
        another tab or on your phone, and the instruction is still built on the old number. Refresh
        and rebuild.
      </p>
      <p>
        <strong>A decimals mistake.</strong> Token amounts are integers in the raw unit, scaled by
        the mint&apos;s decimals. An off-by-one-decimal bug asks for ten times what you hold and
        gets rejected. This shows up in scripts far more than in wallets.
      </p>
      <p>
        <strong>A Token-2022 transfer fee.</strong> If the mint charges a fee on transfer, sending
        your exact full balance fails, because the fee has to come out of the same amount. Send
        slightly less, or use a max or send-all control that accounts for it.
      </p>
      <p>
        <strong>Dust rounding.</strong> A displayed balance of 0 is not necessarily a raw balance of
        0, and the reverse happens too: the interface rounds up to something you do not actually
        hold in full.
      </p>

      <h2>How do I fix it?</h2>
      <p>
        Refresh the page so the app reads current state, then retry with slightly less than the full
        balance. If you are trying to clear an account completely, use the app&apos;s max control
        rather than typing the number you see, because that control reads the raw amount.
      </p>
      <p>
        If it keeps failing at any amount, check the account on a block explorer and look at the raw
        balance rather than the formatted one. That number is the truth, and it is often not what
        your wallet shows.
      </p>

      <h2>I am trying to close the account, not move tokens</h2>
      <p>
        Then you are likely to meet <code>0xb</code> next, which is the token program refusing to
        close an account that still holds a balance.{' '}
        <a href="/errors/custom-program-error-0xb">That one has its own page</a>, and the short
        version is that you have to empty the account first, by swapping the remainder or burning
        it.
      </p>
      <p>
        Which of those two is worth doing depends on whether the remainder has any value left.{' '}
        <a href="/guide/burn-or-swap-dust">Burn or swap</a>{' '}works through the arithmetic.
      </p>
    </ErrorArticle>
  );
}
