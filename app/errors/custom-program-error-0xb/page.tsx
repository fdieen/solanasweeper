import type { Metadata } from 'next';
import ErrorArticle from '@/components/ErrorArticle';
import { getErrorPage } from '@/lib/errors';

const page = getErrorPage('custom-program-error-0xb')!;

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
        Error 11, written <code>0xb</code> in hex, is <code>NonNativeHasBalance</code>. The token
        program states it plainly: a non-native account can only be closed if its balance is zero.
        You are trying to close an account that still holds something.
      </p>

      <h2>But my wallet shows zero</h2>
      <p>
        It shows a rounded number. Balances are stored as integers in the mint&apos;s smallest unit,
        and a wallet displaying four or six decimals will render 0.0000001 of a token as 0.00. The
        account is not empty; it is empty-looking.
      </p>
      <p>
        That remainder is dust, and it comes from ordinary activity: partial fills, a swap that
        routed slightly differently than quoted, rounding on a transfer, or an airdrop you never
        touched. Check the raw amount on a block explorer and you will usually see a long tail of
        digits where your wallet showed nothing.
      </p>

      <h2>The two ways out</h2>
      <p>
        <strong>Swap the remainder.</strong> If the token still trades, sell the dust for SOL. This
        keeps whatever value is left and empties the account in the same move. It only works when a
        route exists, and for most dead tokens it does not.
      </p>
      <p>
        <strong>Burn the remainder.</strong> The burn instruction destroys the tokens and leaves the
        account at a true zero, after which the close succeeds. Irreversible, so it is right for
        junk and wrong for anything you have not identified.
      </p>
      <p>
        Which one pays is a narrower question than it looks, because a swap on a thin pool can cost
        more than it returns.{' '}
        <a href="/guide/burn-or-swap-dust">Burn or swap</a>{' '}sets out the arithmetic, including the
        price impact and Token-2022 transfer fees that eat into the result.
      </p>

      <h2>Doing it from the command line</h2>
      <p>
        Two instructions, in this order. Burn what is left, then close the account and receive the
        rent deposit back:
      </p>
      <pre><code>{`spl-token burn <TOKEN_ACCOUNT> ALL
spl-token close --address <TOKEN_ACCOUNT>`}</code></pre>
      <p>
        For one or two accounts this is the cheapest route there is. It stops being practical
        somewhere around a dozen, which is where batching into fewer transactions starts to matter
        more than the per-account effort.{' '}
        <a href="/guide/how-to-reclaim-your-sol">The three routes</a>{' '}compares them.
      </p>

      <h2>It still fails after burning</h2>
      <p>
        Three possibilities, in order of likelihood.
      </p>
      <p>
        <strong>Withheld transfer fees.</strong> On a Token-2022 mint, fees withheld on transfer sit
        inside the account and block the close even at a zero balance. That surfaces as{' '}
        <code>0x23</code>, and{' '}
        <a href="/errors/custom-program-error-0x23">harvesting them to the mint</a>{' '}clears it.
      </p>
      <p>
        <strong>The account is frozen and still holds a balance.</strong> A frozen account closes
        fine at zero, but freezing blocks the burn you would need to get there. Only the
        token&apos;s freeze authority can lift that.
      </p>
      <p>
        <strong>Close authority was delegated.</strong> Every token account has a close authority,
        which is the owner by default but can be reassigned. If it points elsewhere, only that
        address can close the account.{' '}
        <a href="/guide/what-you-cant-reclaim">What you cannot reclaim</a>{' '}covers this and the
        other dead ends.
      </p>

      <h2>One exception worth knowing</h2>
      <p>
        Wrapped SOL is the case where a balance does not block the close. A wSOL account can be
        closed while it still holds SOL, because the underlying lamports are returned to you as part
        of closing it. Never burn wSOL to empty it first.
      </p>
    </ErrorArticle>
  );
}
