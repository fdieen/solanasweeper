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

export default function Page() {
  return (
    <GuideArticle article={article}>
      <p>
        This catches people out. You sell a token, the SOL disappears from view, and you assume
        it&apos;s gone. It isn&apos;t. It&apos;s still yours, sitting in an account you forgot
        existed.
      </p>

      <h2>Why Solana works this way</h2>
      <p>
        Solana stores data on-chain in accounts. Storing data costs resources, so the network
        requires each account to hold a minimum SOL balance to stay alive. This is called
        rent-exempt status.
      </p>
      <p>
        The name is misleading. You aren&apos;t paying rent in the sense of an ongoing charge. You
        pay a one-time deposit, and the account stays on-chain indefinitely. Think of it like a
        security deposit on an apartment: money held in escrow, returned when you move out.
      </p>
      <p>The current deposit for a standard token account is about 0.00204 SOL.</p>

      <h2>Where your SOL gets stuck</h2>
      <p>
        On Solana, token balances don&apos;t live in your wallet address. Each token gets its own
        token account, tied to your wallet. Buy a memecoin, and a token account is created. Receive
        an airdrop, another account. Mint an NFT, another account.
      </p>
      <p>Each of those accounts holds ~0.00204 SOL as its deposit.</p>
      <p>
        When you sell the token, the balance goes to zero. But the account remains, and so does the
        deposit. Solana doesn&apos;t clean up after you. The account sits there, empty, holding your
        SOL, until you explicitly close it.
      </p>

      <h2>How much adds up</h2>
      <p>The math is simple. Every empty account holds roughly 0.002 SOL you can reclaim.</p>
      <ul>
        <li>25 empty accounts → about 0.05 SOL</li>
        <li>50 → about 0.10 SOL</li>
        <li>100 → about 0.20 SOL</li>
      </ul>
      <p>
        Casual users might have a handful. Anyone who has farmed airdrops or traded memecoins
        through a cycle often has dozens, sometimes hundreds. The accounts accumulate quietly, one
        per token, and nothing in your wallet interface tells you they&apos;re there.
      </p>

      <h2>Reclaiming it</h2>
      <p>
        Closing an empty token account returns the deposit to your wallet. Two conditions apply: the
        balance must be zero, and you must hold the close authority — normally you do, as the account
        owner.
      </p>
      <p>
        For the different ways to do it, see{' '}
        <a href="/guide/how-to-reclaim-your-sol">how to reclaim your SOL</a>.
      </p>

      <h2>What this isn&apos;t</h2>
      <p>
        Reclaiming rent is not free money from nowhere. It&apos;s your own SOL, returned. You paid
        the deposit when the account was created, usually without noticing, and you get it back when
        the account closes.
      </p>
      <p>
        It&apos;s also not a large sum for most people. If you have twenty empty accounts,
        you&apos;ll recover about 0.04 SOL. Useful, not life-changing. The people recovering
        meaningful amounts are the ones with hundreds of accounts from years of trading.
      </p>
      <p>Anyone promising more than that is selling you something.</p>
    </GuideArticle>
  );
}
