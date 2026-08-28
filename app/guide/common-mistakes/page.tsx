import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('common-mistakes')!;

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: article.keywords,
  alternates: { canonical: `/guide/${article.slug}` },
  openGraph: { type: 'article', title: article.title, description: article.description, url: `/guide/${article.slug}` },
  twitter: { card: 'summary_large_image', title: article.title, description: article.description },
};

export default function Page() {
  return (
    <GuideArticle article={article}>
      <p>
        Cleaning a wallet is low-risk right up until it isn&apos;t. Almost every bad outcome in this
        category comes from one of the following, and none of them require bad luck.
      </p>

      <h2>Why shouldn&apos;t I rush a large selection?</h2>
      <p>
        A cleanup on a busy wallet can present a hundred-plus accounts with everything pre-selected.
        The temptation is to accept the default and sign.
      </p>
      <p>
        The problem is that the default selection is a guess made by software about which of your
        accounts matter. It is usually right. When it is wrong, it is wrong about an account that
        looked idle but was holding a position, or a token you were keeping deliberately because it
        is worth something.
      </p>
      <p>
        Scan the list before signing, particularly for anything associated with a protocol rather
        than a token.{' '}
        <a href="/guide/what-you-cant-reclaim">What you can&apos;t reclaim</a>{' '}covers which
        accounts deserve a second look.
      </p>

      <h2>Why verify before burning?</h2>
      <p>Burning is the only irreversible step in the whole process.</p>
      <p>
        Spam tokens are frequently designed to look like real ones — same name, similar ticker,
        different mint address. The mint address is the only thing that distinguishes them, and it
        is visible on any block explorer. Checking takes ten seconds.
      </p>
      <p>
        People make this mistake in both directions. Burning a real token because it looked like
        spam is the expensive one. Burning spam you had not verified is usually harmless, right up
        until the day it isn&apos;t.
      </p>
      <p>
        And burning does not always release rent. If the account still holds other tokens, or is
        frozen with a balance, the account stays open and the burn bought you nothing.
      </p>

      <h2>How do I know the URL is real?</h2>
      <p>Type it, or use a bookmark. That is the whole technique.</p>
      <p>
        Phishing sites in this category are convincing because they only need to be convincing for
        the thirty seconds between arrival and signature. They appear in ads, in search results, in
        replies to posts about reclaiming SOL, and in direct messages from accounts that look
        helpful. The cloned page builds a transaction that drains rather than closes.
      </p>
      <p>
        Do not arrive at a wallet tool from a link someone gave you. Ever. This single habit
        prevents the large majority of real losses here.
      </p>

      <h2>What should I never agree to?</h2>
      <p>
        A seed phrase request. There is no legitimate reason for any web tool to ask for one, and no
        context in which it is safe.
      </p>
      <p>
        Second: a transaction containing <code>SetAuthority</code> on your accounts, or granting a
        delegate on accounts holding value. Neither belongs in a cleanup.{' '}
        <a href="/guide/is-it-safe">What you are actually signing</a>{' '}explains how to spot these
        in the wallet preview.
      </p>

      <h2>How much should I actually expect back?</h2>
      <p>
        Less than the marketing implies. At roughly 0.00204 SOL per empty account, most wallets land
        under 0.1 SOL. A heavily traded wallet from an active season might reach a few tenths.
      </p>
      <p>
        This matters because unrealistic expectations are what phishing sites exploit. If a tool
        tells you there is a lot more than that waiting, the number is either counting things that
        will not close or it is bait.{' '}
        <a href="/guide/what-is-rent-on-solana">How rent is calculated</a>{' '}shows the arithmetic
        so you can sanity-check any figure you are shown.
      </p>

      <h2>Why not skip the safe mode?</h2>
      <p>
        If a tool offers a mode that only closes empty accounts, without burning anything, run that
        first.
      </p>
      <p>
        You get the majority of the recoverable SOL, you take zero irreversible actions, and you get
        to watch how the tool behaves — what it puts in the transaction, where it sends the
        proceeds, whether the fee matches what was advertised — before you let it do anything
        permanent. The burning can always happen afterwards, once you have seen it work.
      </p>

      {/* Zichtbaar FAQ-blok, bewust ZONDER FAQPage-schema: dat staat alleen op /faq. */}
      <h2>Frequently asked questions</h2>

      <h3>I burned a token I shouldn&apos;t have. Can I undo it?</h3>
      <p>
        No. Burning is permanent and there is no recovery path. This is why the mint check is worth
        the ten seconds.
      </p>

      <h3>I connected my wallet to a site I now think was fake. What should I do?</h3>
      <p>
        Connecting alone does not move funds — a signature does. If you signed something, move your
        assets to a fresh wallet immediately and treat the old one as compromised. If you only
        connected, review and revoke any outstanding delegate approvals.
      </p>

      <h3>Is it worth cleaning a wallet with only a few accounts?</h3>
      <p>
        Financially, barely. Five accounts is about 0.01 SOL. At that scale the CLI makes more sense
        than paying a percentage.
      </p>

      <h3>Does closing accounts help my wallet perform better?</h3>
      <p>
        Marginally at most. Some wallet interfaces load faster with fewer accounts to enumerate, but
        the reason to do this is the SOL, not the speed.
      </p>
    </GuideArticle>
  );
}
