import type { Metadata } from "next";
import "./globals.css";
import WalletProviders from "@/components/WalletProviders";
import ReferralCapture from "@/components/ReferralCapture";
import { Analytics } from "@vercel/analytics/next";
import { FEE_PERCENT } from "@/lib/pricing";

const SITE_URL = "https://solanasweeper.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SolanaSweeper · Reclaim Your SOL",
    template: "%s · SolanaSweeper",
  },
  description:
    `Non-custodial Solana wallet cleaner. Close empty token accounts and reclaim locked SOL rent. ${FEE_PERCENT}% fee, no smart contract of its own.`,
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
      `SolanaSweeper is a non-custodial Solana dApp that closes empty SPL Token and Token-2022 accounts and returns the locked rent deposit (~0.00204 SOL per account) to your wallet. It has no smart contract of its own. It only builds instructions to Solana's SPL Token Program. The fee is ${FEE_PERCENT}% of reclaimed rent, taken only from SOL you successfully recover.`,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SolanaSweeper",
      description:
        `Non-custodial Solana wallet cleaner. Close empty token accounts and reclaim locked SOL rent. ${FEE_PERCENT}% fee, no smart contract of its own.`,
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
        `SolanaSweeper is a non-custodial Solana dApp that closes empty SPL Token and Token-2022 accounts and returns the locked rent deposit (~0.00204 SOL per account) to your wallet. It has no smart contract of its own. It only builds instructions to Solana's SPL Token Program. The fee is ${FEE_PERCENT}% of reclaimed rent, taken only from SOL you successfully recover.`,
      // Geen vaste prijs: gratis in gebruik, maar we houden FEE_PERCENT% van de
      // gereclaimde SOL in. price:"0" was feitelijk onjuist → fee expliciet gedeclareerd.
      offers: {
        "@type": "Offer",
        feesAndCommissionsSpecification: `SolanaSweeper charges a ${FEE_PERCENT}% fee on the SOL you reclaim (you keep ${100 - FEE_PERCENT}%). Free to use, no subscription, and nothing is charged if nothing is reclaimed.`,
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
        <ReferralCapture />
        <WalletProviders>{children}</WalletProviders>
        <Analytics />
      </body>
    </html>
  );
}
