import type { Metadata } from 'next';
import ErrorArticle from '@/components/ErrorArticle';
import { getErrorPage } from '@/lib/errors';

const page = getErrorPage('custom-program-error-0x23')!;

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
        Error 35, written <code>0x23</code>, is <code>AccountHasWithheldTransferFees</code> from the
        Token-2022 program. Its own documentation gives you the fix: an account can only be closed
        if its withheld fee balance is zero, so harvest the fees to the mint and try again.
      </p>

      <h2>What are withheld fees?</h2>
      <p>
        Token-2022 lets a mint carry extensions, and one of them is a transfer fee. When a mint uses
        it, every transfer of that token has a percentage skimmed off and parked inside the
        recipient account rather than sent onward immediately. The mint authority later collects it.
      </p>
      <p>
        So after you sell out of such a token, the account can read as zero tokens while still
        holding withheld fees that belong to the mint. The token program will not let you close an
        account that is sitting on somebody else&apos;s fees.
      </p>

      <h2>Why this catches people</h2>
      <p>
        The balance shows zero, the account looks finished, and the close fails anyway with a code
        that means nothing on sight. Most rent tools do not handle it: they list the account as
        reclaimable, build the close, and the whole transaction fails. If a cleanup keeps dying on
        one stubborn account, this is usually why.
      </p>

      <h2>How to clear it</h2>
      <p>
        One extra instruction before the close, sending the withheld amount back to the mint:
      </p>
      <pre><code>{`spl-token harvest-withheld-tokens <MINT> <TOKEN_ACCOUNT>
spl-token close --address <TOKEN_ACCOUNT>`}</code></pre>
      <p>
        Harvesting is permissionless, which is the useful part. You do not need the mint
        authority&apos;s cooperation, because the fees are going where they were always going. Once
        the withheld balance is zero the account closes normally and the rent deposit comes back to
        you.
      </p>
      <p>
        In a batched cleanup the harvest has to be grouped per mint and placed before the closes in
        the same transaction, otherwise the close still sees a non-zero withheld balance.
        SolanaSweeper does this automatically, which is worth saying plainly because most tools
        simply skip these accounts and quietly report a lower total.
      </p>

      <h2>Can I avoid the fee?</h2>
      <p>
        No. The transfer fee is set on the mint, it applies to every transfer including the one that
        moved the tokens out, and there is no opt-out on your side. It is not a charge from your
        wallet or from whatever tool you are using.
      </p>
      <p>
        It is worth knowing about before you swap dust on a Token-2022 mint, because the fee comes
        out of the amount you are selling and can turn a marginal swap into a losing one.{' '}
        <a href="/guide/burn-or-swap-dust">Burn or swap</a>{' '}covers where that line sits.
      </p>

      <h2>Related failures</h2>
      <p>
        If the account also still holds actual tokens, you will meet{' '}
        <a href="/errors/custom-program-error-0xb">0xb</a>{' '}first, which is the plain
        balance-not-zero refusal. Harvesting does not help there; you need to empty the account.
      </p>
      <p>
        And if what you are seeing is the wrapper rather than the code, start at{' '}
        <a href="/errors/transaction-simulation-failed">transaction simulation failed</a>{' '}to find
        which error is actually underneath.
      </p>
    </ErrorArticle>
  );
}
