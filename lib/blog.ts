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

export const BLOG_ARTICLES: BlogArticle[] = [
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
