import type { MetadataRoute } from "next";
import { GUIDE_ARTICLES } from "@/lib/guide";
import { BLOG_ARTICLES } from "@/lib/blog";

const SITE_URL = "https://solanasweeper.com";

/**
 * lastmod per route — de datum waarop de inhoud voor het laatst is veranderd.
 *
 * Stond hier eerder als `new Date()`: dan kreeg elke URL de build-timestamp, dus
 * elke deploy meldde alle pagina's als gewijzigd. Dat maakt het signaal waardeloos
 * (en Google negeert het daarna). Pas een datum hieronder alleen aan als de tekst
 * op die pagina echt verandert — niet bij een styling- of dependency-deploy.
 *
 * Guides en blogposts staan hier niet: die halen hun datum uit lib/guide (dateModified)
 * en lib/blog (datePublished), zodat de datum bij het artikel zelf blijft staan.
 */
const CONTENT_UPDATED: Record<string, string> = {
  "": "2026-08-15",
  "/how-it-works": "2026-08-15",
  "/safety": "2026-08-15",
  "/faq": "2026-08-15",
  "/guide": "2026-07-09",
  "/blog": "2026-07-31",
  "/referral": "2026-07-19",
  "/links": "2026-07-23",
  "/founders": "2026-07-26",
  "/roadmap": "2026-07-22",
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Geen priority: Google negeert het, en een verzonnen rangorde tussen eigen
  // pagina's zegt niets. changeFrequency blijft als hint voor andere crawlers.
  const staticEntries: MetadataRoute.Sitemap = Object.entries(CONTENT_UPDATED).map(
    ([route, lastModified]) => ({
      url: `${SITE_URL}${route}`,
      lastModified,
      changeFrequency: "monthly",
    }),
  );

  const guideEntries: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((a) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: a.dateModified,
    changeFrequency: "monthly",
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.datePublished,
    changeFrequency: "monthly",
  }));

  return [...staticEntries, ...guideEntries, ...blogEntries];
}
