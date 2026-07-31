import type { MetadataRoute } from "next";
import { GUIDE_ARTICLES } from "@/lib/guide";
import { BLOG_ARTICLES } from "@/lib/blog";

const SITE_URL = "https://solanasweeper.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/how-it-works", "/safety", "/faq", "/roadmap", "/founders", "/guide", "/blog"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((a) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: new Date(a.dateModified),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.datePublished),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...guideEntries, ...blogEntries];
}
