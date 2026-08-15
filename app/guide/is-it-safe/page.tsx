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
        The honest answer: closing empty token accounts is one of the safest operations on Solana.
        But &ldquo;the operation is safe&rdquo; and &ldquo;this tool is safe&rdquo; are different
        questions.
      </p>

      <h2>What does closing an account actually do?</h2>
      <p>
        An empty token account holds no tokens. Closing it does one thing: it returns the rent
        deposit to your wallet and removes the account from the chain. Nothing is destroyed, because
        there was nothing in it. Your transaction history is unaffected.
      </p>
      <p>
        Solana&apos;s own documentation describes it plainly: closing an empty account returns the
        rent to your wallet.
      </p>

      <h2>What can a non-custodial tool not do?</h2>
      <p>
        A non-custodial tool never holds your keys. It builds a transaction and asks you to sign it.
        That means:
      </p>
      <ul>
        <li>It cannot move your funds without a signature from you.</li>
        <li>It cannot access other tokens unless the transaction you sign says so.</li>
        <li>It cannot do anything after you close the tab.</li>
      </ul>
      <p>
        The signature is the boundary. Everything a tool does happens because you approved it.
      </p>

      <h2>Where are the real risks?</h2>
      <p>The danger isn&apos;t the operation. It&apos;s the tool, and how you got to it.</p>
      <p>
        <strong>Fake sites.</strong>{' '}The most common attack. Someone clones a popular cleaner,
        buys ads or spams links, and the transaction you&apos;re asked to sign drains your wallet
        instead of closing accounts. Always verify the URL.
      </p>
      <p>
        <strong>Signing without reading.</strong>{' '}Your wallet shows what a transaction does. If
        you approve without looking, you&apos;ve handed over the decision. Read the balance changes
        before you sign.
      </p>
      <p>
        <strong>Burning the wrong thing.</strong>{' '}Closing empty accounts is safe. Burning tokens
        and NFTs is permanent. Any tool that offers burning should make you confirm explicitly. If
        you&apos;re unsure what something is, look it up on Solscan before you destroy it.
      </p>

      <h2>What is the one rule that covers most of it?</h2>
      <p>
        <strong>Don&apos;t trust, verify.</strong>{' '}Check the URL. Read the transaction.
        Understand what you&apos;re signing.
      </p>
      <p>That advice is boring, and it&apos;s why it works.</p>
    </GuideArticle>
  );
}
