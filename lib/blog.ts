/**
 * Blog-registry — één bron van waarheid voor /blog (pagina-metadata + sitemap).
 * Nieuw artikel = een entry hier + een map onder app/blog/<slug>/.
 */
export const SITE_URL = 'https://solanasweeper.com';

export type BlogArticle = {
  slug: string;
  title: string; // <title> + OG/Twitter + JSON-LD headline
  description: string; // meta description
  datePublished: string; // YYYY-MM-DD
  readingTime: string;
};

// Nieuwste eerst: /blog rendert deze volgorde ongewijzigd.
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'insufficient-funds-for-rent-solana',
    title: 'Insufficient funds for rent on Solana: what it means and how to fix it',
    description:
      "Seeing 'insufficient funds for rent' or 'InsufficientFundsForRent' in Phantom, Solflare or Jupiter? Here's what Solana rent is, why the error appears even when you have SOL, and three ways to fix it in under a minute.",
    datePublished: '2026-09-07',
    readingTime: '3 min read',
  },
  {
    slug: 'every-solana-token-costs-0002-sol',
    title: 'Why every Solana token you ever held costs you 0.002 SOL',
    description:
      'Each token you receive on Solana quietly locks 0.002 SOL in a token account — and it stays locked after you sell. Here\'s how the math adds up, how to see your number, and how to get it back.',
    datePublished: '2026-09-07',
    readingTime: '3 min read',
  },
  {
    slug: 'agave-4-2-rent-reduction-reclaimable-sol',
    title:
      'Agave 4.2 Rent Reduction: What It Actually Means for the SOL Locked in Your Token Accounts',
    description:
      "Solana is cutting rent by up to 10x. Your existing token accounts are not affected — here's the math, the activation schedule, and what actually changes.",
    datePublished: '2026-07-31',
    readingTime: '4 min read',
  },
];

export const getBlog = (slug: string) => BLOG_ARTICLES.find((a) => a.slug === slug);
