import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about SolSweep: rent reclaim, safety, fees, Fun Mode vs Pro Mode, supported wallets, and Token-2022 support.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ · SolSweep",
    description:
      "Answers about reclaiming SOL, safety, fees, and how SolSweep cleans your Solana wallet.",
    url: "https://solsweep.io/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
