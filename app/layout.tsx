import type { Metadata } from "next";
import "./globals.css";
import WalletProviders from "@/components/WalletProviders";

const SITE_URL = "https://solanasweeper.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SolanaSweeper · Reclaim Your SOL",
    template: "%s · SolanaSweeper",
  },
  description:
    "SolanaSweeper is a non-custodial Solana dApp that cleans your wallet. Close empty token accounts, burn junk tokens and NFTs, and reclaim locked SOL in one click.",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SolanaSweeper",
    title: "SolanaSweeper · Reclaim Your SOL",
    description:
      "Clean your Solana wallet. Close empty token accounts, burn junk, and reclaim locked SOL in one click. Non-custodial — you sign every transaction.",
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
      "Clean your Solana wallet. Close empty token accounts, burn junk, and reclaim locked SOL in one click.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SolanaSweeper",
      description:
        "Non-custodial Solana wallet cleaner. Reclaim locked SOL from empty token accounts.",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SolanaSweeper",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
    },
    {
      "@type": "SoftwareApplication",
      name: "SolanaSweeper",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Clean your Solana wallet: close empty token accounts, burn junk tokens and NFTs, and reclaim locked SOL. Swaps powered by Jupiter.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
