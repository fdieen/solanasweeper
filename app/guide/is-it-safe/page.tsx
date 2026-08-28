import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('is-it-safe')!;

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
        Closing empty token accounts is one of the safest operations on Solana. But &ldquo;the
        operation is safe&rdquo; and &ldquo;this tool is safe&rdquo; are different questions, and
        conflating them is how people lose wallets.
      </p>

      <h2>What does closing an account actually do?</h2>
      <p>
        It calls one instruction, <code>CloseAccount</code>, in the SPL Token program. That
        instruction transfers the account&apos;s lamports to a destination and deletes the account.
      </p>
      <p>
        What it does not do: it does not touch your other accounts, it does not move your tokens,
        and it does not alter your transaction history. Your on-chain record is permanent — closing
        an account removes the account, not the evidence that it existed.
      </p>
      <p>
        The instruction has one hard precondition: the token balance must be zero. If tokens remain,
        the instruction fails. That is enforced by the token program itself, not by whatever tool is
        calling it, which means no tool can close an account out from under a balance. Accounts that
        fail that test, and the handful that are exceptions for other reasons, are covered in{' '}
        <a href="/guide/what-you-cant-reclaim">what you can&apos;t reclaim</a>.
      </p>

      <h2>What can a non-custodial tool not do?</h2>
      <p>It cannot do anything you have not signed.</p>
      <p>
        This is worth being precise about, because &ldquo;non-custodial&rdquo; gets used loosely. It
        means the tool never holds your private key. It constructs a transaction and hands it to
        your wallet; your wallet shows you what is in it; you sign or you don&apos;t. Without your
        signature the transaction does not exist.
      </p>
      <p>
        So a genuinely non-custodial tool cannot move your SOL, cannot transfer your tokens, and
        cannot act later without you. The security question is therefore not &ldquo;can this tool be
        trusted with my funds&rdquo; — it never has them. The question is narrower and more
        answerable: is the transaction it is asking me to sign the one I think it is?
      </p>

      <h2>How do I read the transaction before I sign?</h2>
      <p>
        Your wallet simulates the transaction and shows you the expected result before you approve.
        Read that screen. It is the single highest-value habit in this entire subject.
      </p>
      <p>What you want to see for a cleanup:</p>
      <ul>
        <li><code>CloseAccount</code>, repeated once per account you selected</li>
        <li>A balance change that is positive — SOL arriving, not leaving</li>
        <li>The destination being your own address</li>
      </ul>
      <p>What should stop you cold:</p>
      <ul>
        <li>
          <code>SetAuthority</code> on your token accounts. This hands control of an account to
          someone else. It has legitimate uses; a wallet cleaner asking for it does not.
        </li>
        <li>
          <code>Approve</code> or a delegate being set on accounts holding real value. This grants
          someone permission to move tokens later, without another signature from you.
        </li>
        <li>Transfer instructions moving tokens you did not intend to move.</li>
        <li>A simulated result showing your balance going down.</li>
        <li>Anything you cannot see at all, because the wallet could not simulate it.</li>
      </ul>
      <p>
        If a tool&apos;s transaction contains instructions beyond closing accounts and paying the
        disclosed fee, that is a question worth having answered before signing, not after.
      </p>

      <h2>Where are the real risks?</h2>
      <p>Three, in descending order of how often they actually bite people.</p>
      <p>
        <strong>Phishing sites.</strong>{' '}By far the biggest. Cleaner tools attract clones
        precisely because their users arrive already intending to sign something. A cloned site
        looks identical, and the transaction it builds drains rather than closes. Typing the URL or
        using a bookmark defeats this entirely, which is why it is worth the two seconds.
      </p>
      <p>
        <strong>Signing without reading.</strong>{' '}Wallets show you the transaction. Clicking
        through it out of habit is what turns a phishing site from an annoyance into a loss.
      </p>
      <p>
        <strong>Burning something valuable.</strong>{' '}Cleanup flows sometimes offer to burn dust
        so the account can be closed. Burning is irreversible. Spam tokens frequently impersonate
        real ones, and the reverse mistake — burning something real because it looked like spam —
        costs more than the rent was ever worth. Verify the mint address on a block explorer before
        burning anything you are not certain about.{' '}
        <a href="/guide/common-mistakes">The mistakes that cost people SOL</a>{' '}covers this case
        in detail.
      </p>

      <h2>What about approvals I granted in the past?</h2>
      <p>
        Worth knowing: a delegate approval granted at some point in the past stays active until it
        is revoked. If you have used a lot of protocols, you may have standing approvals you have
        forgotten about, and those are independent of anything a cleaner does.
      </p>
      <p>
        Reviewing and revoking old approvals is a separate piece of wallet hygiene from reclaiming
        rent, but it belongs in the same afternoon. Block explorers and several wallet interfaces
        will show you what is currently delegated.
      </p>

      <h2>What is the one rule that covers most of it?</h2>
      <p>Verify the URL, then read the transaction.</p>
      <p>
        Almost every real loss in this category traces back to failing one of those two. Everything
        else — which tool, what fee, which wallet — is a preference. Those two are the actual safety
        layer, and they are entirely under your control.
      </p>

      {/* Zichtbaar FAQ-blok, bewust ZONDER FAQPage-schema: dat staat alleen op /faq. */}
      <h2>Frequently asked questions</h2>

      <h3>Can a wallet cleaner steal my tokens?</h3>
      <p>
        Not without a signature from you. What it can do is ask you to sign something other than
        what you expect, which is why reading the transaction matters more than trusting the brand.
      </p>

      <h3>Is it safer to use the CLI?</h3>
      <p>
        Differently risky. There is no third-party site involved, but your private key sits in a
        file on your machine rather than in a wallet&apos;s secure storage. Neither is strictly
        safer;{' '}
        <a href="/guide/how-to-reclaim-your-sol">the three ways to close token accounts</a>{' '}
        compares them.
      </p>

      <h3>Does closing an account affect my transaction history?</h3>
      <p>
        No. On-chain history is permanent and public. Closing removes the account, not the record.
      </p>

      <h3>Can I check my wallet without connecting it?</h3>
      <p>
        Yes. Balances are public data. Any tool requiring a connection merely to display a number is
        asking for more access than the task requires.
      </p>
    </GuideArticle>
  );
}
