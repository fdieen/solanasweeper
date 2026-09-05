import type { Metadata } from "next";
import "./globals.css";
import WalletProviders from "@/components/WalletProviders";
import ReferralCapture from "@/components/ReferralCapture";
import { SiteSchema } from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { FEE_PERCENT } from "@/lib/pricing";

const SITE_URL = "https://solanasweeper.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Zoekterm vooraan, merk erachter. Kindpagina's die de generieke term zelf al
  // vooraan zetten, gebruiken title.absolute i.p.v. deze template.
  title: {
    default: "Reclaim SOL Rent and Sweep Dust into SOL — SolanaSweeper",
    template: "%s · SolanaSweeper",
  },
  description:
    "Close the empty token accounts in your Solana wallet, reclaim about 0.00204 SOL rent each, and swap your dust to SOL instead of burning it. Non-custodial.",
  applicationName: "SolanaSweeper",
  keywords: [
    "Solana",
    "SOL",
    "reclaim SOL",
    "rent reclaim",
    "close token accounts",
    "clean Solana wallet",
    "burn tokens",
    "Token-2022",
    "Jupiter swap",
    "non-custodial dApp",
    "crypto wallet cleaner",
  ],
  authors: [{ name: "SolanaSweeper" }],
  creator: "SolanaSweeper",
  publisher: "SolanaSweeper",
  // Bewust GEEN alternates.canonical hier: metadata erft naar beneden door, dus een
  // canonical in de root-layout laat elke route zonder eigen canonical naar de homepage
  // wijzen (dat maakte /links een "duplicaat" in Search Console). Elke route zet nu zijn
  // eigen self-referencing canonical naar de schone URL — zonder queryparameters, zodat
  // ?ref=-varianten naar het origineel verwijzen terwijl de bezoeker op de parameter-URL
  // blijft (de referral-attributie in lib/referral.ts leest die client-side).
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SolanaSweeper",
    title: "Reclaim SOL Rent and Sweep Dust into SOL — SolanaSweeper",
    description:
      "Close the empty token accounts in your Solana wallet, reclaim about 0.00204 SOL rent each, and swap your dust to SOL instead of burning it. Non-custodial.",
    locale: "en_US",
    // Statische PNG in /public i.p.v. een dynamische edge-route: die gaf 0 bytes
    // terug, waardoor de X/OG-card leeg bleef. Statisch is betrouwbaar voor crawlers.
    images: [
      {
        url: `${SITE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: "SolanaSweeper — Reclaim your SOL",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolanaSweeper · Reclaim Your SOL",
    description:
      `Non-custodial Solana wallet cleaner. Close empty token accounts and reclaim locked SOL rent. ${FEE_PERCENT}% fee, no smart contract of its own.`,
    images: [`${SITE_URL}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteSchema />
        <ReferralCapture />
        <WalletProviders>{children}</WalletProviders>
        <Analytics />
      </body>
    </html>
  );
}
