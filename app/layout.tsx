import type { Metadata } from "next";
import "./globals.css";
import WalletProviders from "@/components/WalletProviders";

const SITE_URL = "https://solsweeper.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SolSweeper · Reclaim Your SOL",
    template: "%s · SolSweeper",
  },
  description:
    "SolSweeper is a non-custodial Solana dApp that cleans your wallet. Close empty token accounts, burn junk tokens and NFTs, and reclaim locked SOL in one click.",
  applicationName: "SolSweeper",
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
  authors: [{ name: "SolSweeper" }],
  creator: "SolSweeper",
  publisher: "SolSweeper",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SolSweeper",
    title: "SolSweeper · Reclaim Your SOL",
    description:
      "Clean your Solana wallet. Close empty token accounts, burn junk, and reclaim locked SOL in one click. Non-custodial — you sign every transaction.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolSweeper · Reclaim Your SOL",
    description:
      "Clean your Solana wallet. Close empty token accounts, burn junk, and reclaim locked SOL in one click.",
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
      name: "SolSweeper",
      description:
        "Non-custodial Solana wallet cleaner. Reclaim locked SOL from empty token accounts.",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SolSweeper",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
    },
    {
      "@type": "SoftwareApplication",
      name: "SolSweeper",
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
