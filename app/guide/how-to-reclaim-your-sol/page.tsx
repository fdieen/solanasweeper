import type { Metadata } from 'next';
import GuideArticle from '@/components/GuideArticle';
import { getGuide } from '@/lib/guide';

const article = getGuide('how-to-reclaim-your-sol')!;

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
      <h2>Manually, using Solana&apos;s CLI</h2>
      <p>
        If you&apos;re comfortable with a terminal, you don&apos;t need a tool. Solana&apos;s own
        command-line interface can find and close empty token accounts.
      </p>
      <p>
        The commands are <code>spl-token accounts</code>{' '}to list them and{' '}
        <code>spl-token close</code>{' '}to close each one. You&apos;ll need the Solana CLI installed,
        your wallet keypair accessible, and the patience to do it account by account.
      </p>
      <p>
        <strong>Trade-off:</strong>{' '}free, and nothing touches your keys but you. Slow if you have
        many accounts, and it requires setting up a development environment. Not realistic for most
        people.
      </p>

      <h2>Through your wallet</h2>
      <p>
        Some wallets have started adding account cleanup. Check your wallet&apos;s settings before
        reaching for a tool.
      </p>
      <p>
        <strong>Trade-off:</strong>{' '}convenient if your wallet supports it. Coverage varies, and
        most wallets only handle simple cases.
      </p>

      <h2>With a wallet cleaner</h2>
      <p>
        Tools scan your wallet, find closeable accounts, and batch the close instructions into one
        or a few transactions. You review and sign; the tool never holds your keys.
      </p>
      <p>
        <strong>Trade-off:</strong>{' '}fastest option, handles hundreds of accounts. Tools charge a
        fee, taken from the reclaimed SOL. Fees vary between tools, from roughly 2% to 20%.
      </p>

      <h2>What to check before you use any tool</h2>
      <ul>
        <li>
          <strong>The URL.</strong>{' '}Fake versions of popular cleaners exist. Type it, don&apos;t
          click a link from a DM.
        </li>
        <li>
          <strong>Non-custodial.</strong>{' '}The tool should never ask for your seed phrase or
          private key. It should only request a signature on a transaction you can review.{' '}
          <a href="/guide/is-it-safe">More on what that means</a>.
        </li>
        <li>
          <strong>Read the transaction before signing.</strong>{' '}Your wallet shows you exactly
          what will happen. If accounts you didn&apos;t select are being touched, cancel.
        </li>
        <li>
          <strong>Start with the safe mode.</strong>{' '}Most tools separate &ldquo;close empty
          accounts&rdquo; (reversible in the sense that nothing is destroyed) from &ldquo;burn
          tokens and NFTs&rdquo; (permanent). Begin with the first.
        </li>
      </ul>
    </GuideArticle>
  );
}
