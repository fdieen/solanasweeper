/**
 * Guide-artikel-registry
 * ----------------------
 * Één bron van waarheid voor de /guide-sectie: gebruikt door de overzichtspagina,
 * de sitemap, de Article-JSON-LD, de prev/next-navigatie en de interne links.
 * Nieuwe pagina = een entry hier (in leesvolgorde) + een map onder app/guide/<slug>/.
 */

export const SITE_URL = 'https://solanasweeper.com';

export type GuideArticle = {
  slug: string;
  /** Pagina <title> (zonder site-suffix; gericht op de hoofdzoekterm) */
  title: string;
  /** On-page h1 */
  h1: string;
  /** Meta description */
  description: string;
  keywords: string[];
  /** Korte samenvatting: index-kaart + lead */
  excerpt: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string;  // YYYY-MM-DD
  readingTime: string;   // bv. "4 min read"
};

/** Leesvolgorde bepaalt de prev/next-navigatie. */
export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'what-is-rent-on-solana',
    title: 'What Is Rent on Solana? How to Reclaim Your Locked SOL',
    h1: 'What is rent on Solana?',
    description:
      'Rent is the small SOL deposit every Solana account holds to stay on-chain. Learn what rent is, why your wallet fills with empty token accounts, and how much you can reclaim.',
    keywords: [
      'Solana rent', 'what is rent on Solana', 'token account rent',
      'reclaim SOL rent', 'rent exemption Solana', 'empty token accounts',
    ],
    excerpt: 'Every account on Solana holds a small amount of SOL. Not as a fee, but as a deposit.',
    datePublished: '2026-07-09',
    dateModified: '2026-07-09',
    readingTime: '5 min read',
  },
  {
    slug: 'how-to-reclaim-your-sol',
    title: 'How to Reclaim Your SOL: 3 Ways to Close Token Accounts',
    h1: 'How to reclaim your SOL',
    description:
      "Three ways to get your locked SOL back on Solana: the CLI, your wallet, or a wallet cleaner. The trade-offs of each, and what to check before you use any tool.",
    keywords: [
      'how to reclaim SOL', 'close token accounts Solana', 'spl-token close',
      'Solana wallet cleaner', 'reclaim rent Solana',
    ],
    excerpt: 'Three ways to get your locked SOL back. Each has trade-offs.',
    datePublished: '2026-07-09',
    dateModified: '2026-07-09',
    readingTime: '4 min read',
  },
  {
    slug: 'is-it-safe',
    title: 'Is It Safe to Close Solana Token Accounts?',
    h1: 'Is it safe?',
    description:
      "Closing empty token accounts is one of the safest operations on Solana. Here's what it actually does, what a non-custodial tool can and can't do, and where the real risks are.",
    keywords: [
      'is it safe to close token accounts', 'Solana wallet cleaner safe',
      'non-custodial Solana', 'reclaim rent safe', 'Solana drainer',
    ],
    excerpt:
      'Closing empty token accounts is one of the safest operations on Solana. The tool you use is a different question.',
    datePublished: '2026-07-09',
    dateModified: '2026-07-09',
    readingTime: '4 min read',
  },
  {
    slug: 'what-you-cant-reclaim',
    title: "What You Can't Reclaim on Solana (Dust, cNFTs, Metadata)",
    h1: "What you can't reclaim",
    description:
      'Not every account gives SOL back. Dust balances, delegated close authority, compressed NFTs, in-use accounts, and metadata rent. What stays locked, and why.',
    keywords: [
      "what you can't reclaim Solana", 'compressed NFT rent', 'metadata account rent',
      'token dust Solana', 'close authority delegated',
    ],
    excerpt:
      "Most guides tell you what a tool does. Fewer tell you what it doesn't. Here's what won't come back.",
    datePublished: '2026-07-09',
    dateModified: '2026-07-09',
    readingTime: '3 min read',
  },
  {
    slug: 'common-mistakes',
    title: 'Common Mistakes When Cleaning a Solana Wallet',
    h1: 'Common mistakes',
    description:
      'The mistakes that cost people SOL, or their whole wallet, when reclaiming rent: rushing a large selection, burning before verifying, fake URLs, and skipping the safe mode.',
    keywords: [
      'Solana wallet cleaning mistakes', 'reclaim SOL mistakes',
      'fake Solana cleaner', 'burn tokens mistake', 'Solscan verify mint',
    ],
    excerpt: 'The small mistakes that cost people SOL, or their whole wallet. Avoid these five.',
    datePublished: '2026-07-09',
    dateModified: '2026-07-09',
    readingTime: '2 min read',
  },
];

export const getGuide = (slug: string): GuideArticle | undefined =>
  GUIDE_ARTICLES.find((a) => a.slug === slug);

export const getGuideNav = (slug: string) => {
  const i = GUIDE_ARTICLES.findIndex((a) => a.slug === slug);
  return {
    index: i,
    total: GUIDE_ARTICLES.length,
    prev: i > 0 ? GUIDE_ARTICLES[i - 1] : undefined,
    next: i >= 0 && i < GUIDE_ARTICLES.length - 1 ? GUIDE_ARTICLES[i + 1] : undefined,
  };
};
