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
      <h2>Why shouldn&apos;t I rush a large selection?</h2>
      <p>
        If you&apos;re cleaning a wallet with a hundred items, slow down. Look at what&apos;s
        selected before you sign.
      </p>

      <h2>Why verify before burning?</h2>
      <p>
        Spam tokens sometimes mimic the names of real projects. Check the mint address on Solscan
        before you destroy anything.
      </p>

      <h2>How do I know the URL is real?</h2>
      <p>Type the address yourself or open it from your own bookmark. Never a link in a DM, ad, or search result.</p>
      <p>
        This bears repeating because it&apos;s how people lose wallets. Fake cleaner sites exist and
        have caught users. If you only take one thing from this guide, take{' '}
        <a href="/guide/is-it-safe">don&apos;t trust, verify</a>.
      </p>

      <h2>How much should I actually expect back?</h2>
      <p>
        For most wallets, the total is under 0.1 SOL. Useful, but modest. Anyone promising more is
        selling something.
      </p>

      <h2>Why not skip the safe mode?</h2>
      <p>
        Every cleaner separates closing (safe) from burning (permanent). If you&apos;re new to a
        tool, use closing first and see how it behaves.
      </p>
    </GuideArticle>
  );
}
