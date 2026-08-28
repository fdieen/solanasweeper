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
      'Rent is the SOL deposit every Solana account holds to stay on-chain. How it is calculated, what Token-2022 and SIMD-0437 change, and how to reclaim it.',
    keywords: [
      'Solana rent', 'what is rent on Solana', 'token account rent',
      'reclaim SOL rent', 'rent exemption Solana', 'empty token accounts',
      'rent exempt minimum', 'lamports per byte', 'Token-2022 rent', 'SIMD-0437',
    ],
    excerpt:
      'Your wallet is holding SOL you cannot spend. Not because anyone is charging you, but because every account on Solana carries a storage deposit — one you can get back.',
    datePublished: '2026-07-09',
    dateModified: '2026-08-28',
    readingTime: '7 min read',
  },
  {
    slug: 'how-to-reclaim-your-sol',
    title: 'How to Reclaim Your SOL: 3 Ways to Close Token Accounts',
    h1: 'How to reclaim your SOL',
    description:
      'Three ways to close Solana token accounts and get the rent back: the CLI, your wallet, or a cleaner. The commands, the batching limits, and what each costs.',
    keywords: [
      'how to reclaim SOL', 'close token accounts Solana', 'spl-token close',
      'Solana wallet cleaner', 'reclaim rent Solana',
    ],
    excerpt:
      'There are three ways to get locked SOL out of your token accounts. They differ in effort, cost, and trust.',
    datePublished: '2026-07-09',
    dateModified: '2026-08-28',
    readingTime: '4 min read',
  },
  {
    slug: 'is-it-safe',
    title: 'Is It Safe to Close Solana Token Accounts?',
    h1: 'Is it safe?',
    description:
      'Closing token accounts is safe. Tools that do it for you are another question. How to read the transaction, and the four instructions to watch for.',
    keywords: [
      'is it safe to close token accounts', 'Solana wallet cleaner safe',
      'non-custodial Solana', 'reclaim rent safe', 'Solana drainer',
    ],
    excerpt:
      'The operation is one of the safest on Solana. Whether a given tool is safe is an entirely different question.',
    datePublished: '2026-07-09',
    dateModified: '2026-08-28',
    readingTime: '4 min read',
  },
  {
    slug: 'what-you-cant-reclaim',
    title: "What You Can't Reclaim on Solana (Dust, cNFTs, Metadata)",
    h1: "What you can't reclaim",
    description:
      'Not every account returns SOL. Dust, frozen accounts, delegated close authority, compressed NFTs, in-use positions and metadata — what stays locked, and why.',
    keywords: [
      "what you can't reclaim Solana", 'compressed NFT rent', 'metadata account rent',
      'token dust Solana', 'close authority delegated',
    ],
    excerpt:
      "Most guides tell you what a tool does. Fewer tell you what it doesn't. Here is what will not come back.",
    datePublished: '2026-07-09',
    dateModified: '2026-08-28',
    readingTime: '4 min read',
  },
  {
    slug: 'common-mistakes',
    title: 'Common Mistakes When Cleaning a Solana Wallet',
    h1: 'Common mistakes',
    description:
      'The mistakes that cost people SOL, or their whole wallet: rushing a selection, burning unverified tokens, fake URLs, and expecting the wrong number.',
    keywords: [
      'Solana wallet cleaning mistakes', 'reclaim SOL mistakes',
      'fake Solana cleaner', 'burn tokens mistake', 'Solscan verify mint',
    ],
    excerpt:
      'The small mistakes that cost people SOL — and the one that costs them everything. Six things to avoid.',
    datePublished: '2026-07-09',
    dateModified: '2026-08-28',
    readingTime: '3 min read',
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
