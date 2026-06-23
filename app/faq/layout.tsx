import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about SolanaSweeper: rent reclaim, safety, fees, Fun Mode vs Pro Mode, supported wallets, and Token-2022 support.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ · SolanaSweeper",
    description:
      "Answers about reclaiming SOL, safety, fees, and how SolanaSweeper cleans your Solana wallet.",
    url: "https://solanasweeper.com/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
