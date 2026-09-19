import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('burn-or-swap-dust')!;

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
        Two ways to empty a token account that still holds a fraction of something. Swap the
        fraction for SOL, or burn it. Swapping keeps whatever value is left and burning destroys it,
        so swapping looks like the obvious choice. For most dust it is the wrong one, and the reason
        has nothing to do with which tool you use.
      </p>

      <h2>Should I burn dust or swap it?</h2>
      <p>
        Swap it when a route exists and the quote comes back worth more than the swap costs you.
        Burn it when no route exists, or when the quote is worth less than the transaction that
        would deliver it. That is the whole decision, and for the large majority of dust sitting in
        ordinary wallets the answer is burn.
      </p>
      <p>
        Dust accumulates from failed swaps, partial fills, rounding remainders and unsolicited
        airdrops. Those last two categories tend to be tokens that no longer trade anywhere. A token
        with no liquidity pool has no price, so there is nothing to swap it into.
      </p>

      <h2>How much is dust actually worth?</h2>
      <p>
        Usually less than the rent underneath it. An empty token account holds a deposit of roughly
        0.00204 SOL, and that number is the same whether the account once held a dead airdrop or a
        serious position. The dust inside it is frequently worth a fraction of a cent.
      </p>
      <p>
        This is worth saying plainly, because it cuts against how these tools are usually sold: the
        rent is the reliable prize and the dust is the lottery ticket. If you are choosing a method
        purely on how much SOL comes back, you are optimising the smaller of the two numbers.
      </p>

      <h2>What does swapping dust actually cost?</h2>
      <p>
        Three things, and only the first is obvious.
      </p>
      <p>
        The network fee, which is small but not zero, and is charged whether the swap succeeds or
        fails. The pool&apos;s own trading fee, which is a percentage the liquidity providers take.
        And price impact, which is where thin pools punish you. Selling into a pool with very little
        liquidity moves the price against you as you sell, and on genuinely small pools a swap can
        return a fraction of the quoted value. An aggregator such as Jupiter routes around the worst
        of this where it can, but it cannot conjure liquidity that does not exist.
      </p>
      <p>
        There is a fourth cost that catches people out. Under Token-2022, a mint can carry a
        transfer fee extension, which takes a cut of every transfer, including the one that moves
        your tokens into the pool. It is set by the token, not by your wallet or your tool, and you
        cannot opt out of it.
      </p>

      <h2>When is burning the right answer?</h2>
      <p>
        When there is no route, which is the common case. When the quote is worth less than the
        network fee, which is the second most common case. And when the token cannot be sold at all:
        some mints carry a freeze authority that has been used, or a transfer restriction that makes
        a swap fail on submission.
      </p>
      <p>
        Burning is not a consolation prize in those situations. It empties the account, which is the
        precondition for closing it, and closing it is what returns the rent. You are not giving up
        value, you are removing the obstacle in front of the value that was always the larger half.
      </p>

      <h2>When is swapping clearly worth it?</h2>
      <p>
        When the token still trades with real liquidity and the position is worth meaningfully more
        than the fees. A leftover 0.4 of a token that still has a market is worth recovering. So is
        anything where you are not certain the token is dead, because burning is irreversible and
        swapping is not.
      </p>
      <p>
        Wrapped SOL deserves a mention of its own. A wSOL account can be closed while it still holds
        a balance, because the underlying SOL is returned as part of the close. Never burn wSOL.
      </p>

      <h2>Is burning dangerous?</h2>
      <p>
        The instruction itself is not. It is part of the token program and it does exactly one
        thing. The danger is in what you point it at.
      </p>
      <p>
        Burning cannot be undone, so the mint you are burning is worth a look before you sign. And
        there is a category of airdropped token designed to be interacted with, where the goal is to
        get you to a site that asks for a signature that has nothing to do with burning. The safe
        handling for an unsolicited token you do not recognise is to burn it locally and close the
        account, never to follow whatever link its metadata points at.{' '}
        <a href="/guide/common-mistakes">The mistakes that cost people money</a>{' '}covers the rest.
      </p>

      <h2>Do I need a tool for this?</h2>
      <p>
        No. Burning and closing are two instructions, and the Solana CLI will run both against a
        single account in about a minute. That is genuinely the cheapest route, and for one or two
        accounts it is the one we would use ourselves.
      </p>
      <p>
        Tools earn their keep at volume, where the work is selecting which accounts are safe to
        touch, batching the instructions into as few transactions as possible, and not burning
        something you meant to keep.{' '}
        <a href="/guide/how-to-reclaim-your-sol">The three routes</a>{' '}sets out what each one costs
        in effort and in trust.
      </p>

      <h2>A rule that holds up</h2>
      <p>
        Ask for a quote first. If a route exists and it is worth more than the swap will cost you,
        take it. If it does not, burn and move on, because the rent underneath is the part that was
        always going to pay. Anything that tells you every token in your wallet is worth converting
        is selling you the lottery ticket and hoping you do not check the price.
      </p>
      <p>
        What will not come back at all, regardless of which route you take, is covered in{' '}
        <a href="/guide/what-you-cant-reclaim">what you cannot reclaim</a>.
      </p>
    </GuideArticle>
  );
}
