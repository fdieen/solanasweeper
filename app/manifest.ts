import type { MetadataRoute } from "next";

// Next injecteert automatisch <link rel="manifest"> — voor een net mobiel/PWA-icoon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolanaSweeper",
    short_name: "Sweeper",
    description: "Clean your Solana wallet and reclaim locked SOL.",
    start_url: "/",
    display: "standalone",
    background_color: "#04040a",
    theme_color: "#0a0618",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
