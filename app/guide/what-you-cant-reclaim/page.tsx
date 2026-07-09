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
        Most guides tell you what a tool does. Fewer tell you what it doesn&apos;t. Here&apos;s what
        won&apos;t come back, no matter which tool you use.
      </p>

      <h2>Accounts with a balance, even a tiny one</h2>
      <p>
        A token account must be completely empty to close. A balance of 0.000001 tokens blocks it.
        Dust like this is common, especially from failed swaps or spam airdrops.
      </p>
      <p>
        To close the account, you first have to get rid of the balance. That means either
        transferring it away or burning it. Burning is permanent.
      </p>

      <h2>Accounts where close authority was delegated</h2>
      <p>
        Normally the account owner can close it. But close authority can be assigned to another
        address. If that happened, you can&apos;t close the account yourself, even though it&apos;s
        associated with your wallet.
      </p>
      <p>This is rare, but it exists.</p>

      <h2>Compressed NFTs</h2>
      <p>
        Compressed NFTs (cNFTs) don&apos;t hold a rent deposit the way standard NFTs do. They live
        in a Merkle tree, not in individual accounts. Burning them returns little or nothing.
      </p>
      <p>If a tool implies you&apos;ll recover meaningful SOL from cNFTs, be skeptical.</p>

      <h2>Accounts an app is using</h2>
      <p>
        Some DeFi protocols use token accounts as escrow or as temporary holding accounts for open
        positions. Closing one of these can break a withdrawal later.
      </p>
      <p>
        If you have open positions in a protocol, be careful about closing accounts you don&apos;t
        recognize.
      </p>

      <h2>Metadata accounts</h2>
      <p>
        An NFT creates more than one account. The token account holds the rent, but there&apos;s
        also a metadata account. Most cleaners close the token account only, which returns about
        0.002 SOL. Reclaiming metadata rent requires a different instruction and not every tool does
        it.
      </p>
      <p>
        This is why estimates of &ldquo;how much you get back per NFT&rdquo; vary between tools.
        Check what a tool actually closes.
      </p>
    </GuideArticle>
  );
}
