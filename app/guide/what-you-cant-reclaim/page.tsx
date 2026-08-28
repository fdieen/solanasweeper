import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('what-you-cant-reclaim')!;

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
        Every rent estimate you see is an upper bound. Some of the accounts in your wallet will not
        close, and a few of them hold no reclaimable rent in the first place. Knowing which is which
        saves you from expecting a number you were never going to get. If you have not read{' '}
        <a href="/guide/what-is-rent-on-solana">how the deposit works</a>{' '}in the first place,
        start there.
      </p>

      <h2>Why can&apos;t I close an account with a balance?</h2>
      <p>
        The close instruction requires a zero token balance. This is enforced by the token program,
        so no tool can work around it.
      </p>
      <p>
        The problem is that &ldquo;empty&rdquo; and &ldquo;zero&rdquo; are not the same thing.
        Failed swaps, partial fills, airdrops of worthless tokens and rounding remainders all leave
        tiny fractions behind — dust. An account holding 0.0000001 of some token is not closeable
        until that fraction is gone.
      </p>
      <p>
        Two ways out. Swap the dust for SOL, which recovers whatever trace value exists but only
        works if there is a route with any liquidity at all — for most dust there is not. Or burn
        it, which destroys the tokens and empties the account. Burning is irreversible, so it is the
        right answer for genuine junk and the wrong one for anything you have not verified. Once an
        account is genuinely empty, closing it is the straightforward part —{' '}
        <a href="/guide/how-to-reclaim-your-sol">the three ways to do it</a>{' '}are here.
      </p>
      <p>
        One exception in the other direction: wrapped SOL accounts can be closed while holding a
        balance, because the underlying SOL is reclaimed as part of the close. wSOL is the one case
        where a non-zero balance is not a blocker.
      </p>

      <h2>What about frozen accounts?</h2>
      <p>
        This is widely stated wrongly, including in earlier versions of this guide.
      </p>
      <p>
        A frozen account can be closed, provided its token balance is zero. Freezing does not block
        the close instruction. What it blocks is transferring or burning, which is exactly what you
        would need to do to empty an account that still holds tokens.
      </p>
      <p>
        So the real rule is: frozen and empty closes normally; frozen with a balance is genuinely
        stuck, because you cannot clear the balance while the freeze is in place. Only the
        token&apos;s freeze authority can lift it.
      </p>

      <h2>What if close authority was delegated?</h2>
      <p>
        Every token account has a close authority, which is the owner by default. It can be
        reassigned to another address.
      </p>
      <p>
        Where that has happened, the owner can no longer close the account themselves — only the
        designated close authority can. This is uncommon in ordinary wallets and shows up mostly
        around protocols that manage accounts on a user&apos;s behalf. If an account refuses to
        close and the balance is zero and it is not frozen, a delegated close authority is the
        likely explanation.
      </p>

      <h2>Why don&apos;t compressed NFTs count?</h2>
      <p>
        Compressed NFTs do not live in individual accounts. They live as leaves in a Merkle tree,
        with one on-chain account covering thousands of items. That is the entire point of
        compression, and it is why minting them is so cheap.
      </p>
      <p>
        The consequence for rent is direct: there is no per-item account, so there is no per-item
        rent deposit to recover. Burning a cNFT does not release a rent deposit to you.
      </p>
      <p>
        Treat any tool advertising meaningful SOL recovery from compressed NFTs with real suspicion.
        The arithmetic does not work, and a promise that cannot be kept is usually attached to
        something else.
      </p>

      <h2>What about accounts an app is using?</h2>
      <p>Some accounts look idle and are not.</p>
      <p>
        Protocol positions, escrow accounts, vault authorities and staking-related accounts can sit
        at zero token balance while still being structurally necessary to something. Closing one may
        break a withdrawal path or orphan a position, and the rent you recover will be a fraction of
        what untangling it costs.
      </p>
      <p>
        The signal to watch for is provenance: if an account is associated with a protocol you have
        used rather than with a token you have traded, leave it alone unless you know exactly what
        it does. A good cleaner flags these rather than selecting them by default.
      </p>

      <h2>Can I close metadata accounts?</h2>
      <p>
        NFT metadata lives in a separate account from the token account, with its own rent deposit.
        It is closed by a different instruction in a different program, which means a tool that only
        closes token accounts recovers the token account&apos;s rent and leaves the metadata rent
        behind.
      </p>
      <p>
        This is not a fault so much as a scope limit, but it is worth knowing when you compare what
        two tools report as recoverable. They may both be right and simply counting different
        things.
      </p>

      <h2>What about the mint account?</h2>
      <p>
        The mint — the account defining the token itself — is not yours unless you created the
        token. It holds its own rent, it belongs to whoever has mint authority, and it is not part
        of what a wallet cleanup touches. Nothing in your wallet gives you a claim on it.
      </p>

      {/* Zichtbaar FAQ-blok, bewust ZONDER FAQPage-schema: dat staat alleen op /faq. */}
      <h2>Frequently asked questions</h2>

      <h3>If a tool says I can recover 0.4 SOL, will I get 0.4 SOL?</h3>
      <p>
        Minus the fee, and only for the accounts that actually close. A good estimate excludes
        accounts with dust, frozen accounts with balances and delegated ones. Compare the estimate
        against what the transaction preview says before you sign.
      </p>

      <h3>Should I burn dust to close the account?</h3>
      <p>
        For genuine junk, yes — the rent is worth more than the dust. Verify the mint on a block
        explorer first.{' '}
        <a href="/guide/common-mistakes">The mistakes that cost people SOL</a>{' '}covers what goes
        wrong here.
      </p>

      <h3>Can I get the rent back from an NFT I burned?</h3>
      <p>
        The token account&apos;s rent, yes, once the balance is zero. The metadata account&apos;s
        rent needs a separate instruction, and not every tool does it.
      </p>

      <h3>Why do two tools give me different numbers?</h3>
      <p>
        Usually scope: whether they count metadata accounts, whether they include accounts holding
        dust, and whether they read each account&apos;s real balance or assume the standard rent
        figure.
      </p>
    </GuideArticle>
  );
}
