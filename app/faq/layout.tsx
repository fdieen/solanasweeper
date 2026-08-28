import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Solana Rent & Token Account FAQ — 12 Common Questions · SolanaSweeper" },
  description:
    "12 common questions about Solana rent and token accounts: how much you reclaim, whether it is safe, the fee, Token-2022 support and supported wallets.",
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
