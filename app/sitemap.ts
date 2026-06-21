import type { MetadataRoute } from "next";

const SITE_URL = "https://solsweep.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/how-it-works", "/safety", "/faq", "/roadmap"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
