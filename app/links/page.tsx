// app/links/page.tsx — SolanaSweeper link hub (linktree-vervanger)
// Bio-link voor X en TikTok: solanasweeper.com/links
// NB voor Claude Code: check paden van logo/SOL-E assets en pas aan naar
// de bestaande componenten/utilities van de repo waar logisch.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Links — SolanaSweeper",
  description:
    "All official SolanaSweeper links. Reclaim the SOL locked in your empty token accounts.",
  robots: { index: true, follow: true },
};

const LINKS = [
  {
    href: "https://solanasweeper.com",
    label: "Sweep your wallet",
    sub: "Check any wallet — no connect needed",
    primary: true,
  },
  {
    href: "https://x.com/solanasweeper_",
    label: "X / Twitter",
    sub: "@solanasweeper_",
  },
  {
    href: "https://youtube.com/@SolanaSweeperOfficial",
    label: "YouTube",
    sub: "@SolanaSweeperOfficial",
  },
  {
    href: "https://www.tiktok.com/@solanasweeperofficial",
    label: "TikTok",
    sub: "@solanasweeperofficial",
  },
  {
    href: "https://solanasweeper.com/guide",
    label: "Guides",
    sub: "How Solana rent works",
  },
  // Na referral-launch aanzetten:
  // {
  //   href: "https://solanasweeper.com/referral",
  //   label: "Referral program",
  //   sub: "Earn 25% of the platform fee",
  // },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-[#080B16] text-white relative overflow-hidden">
      {/* nevel-achtergrond zoals de homepage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(43,66,150,0.35), transparent 60%), radial-gradient(ellipse 45% 40% at 65% 55%, rgba(88,55,170,0.30), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center px-6 py-16">
        {/* SOL-E — pad aanpassen aan bestaand asset in de repo */}
        <Image
          src="/sol-e.png"
          alt="SOL-E"
          width={120}
          height={120}
          priority
          className="drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
        />

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Solana<span className="text-[#9945FF]">Sweeper</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/70">
          Close empty token accounts, reclaim locked SOL. Non-custodial — you
          keep 90%.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.href.startsWith("https://solanasweeper.com") ? undefined : "_blank"}
              className={
                l.primary
                  ? "group rounded-xl bg-[#9945FF] px-5 py-4 text-center transition hover:bg-[#8134f0]"
                  : "group rounded-xl border border-[#9945FF]/30 bg-white/[0.03] px-5 py-4 text-center transition hover:border-[#9945FF]/60 hover:bg-white/[0.06]"
              }
            >
              <span className="block font-semibold">{l.label}</span>
              <span
                className={
                  l.primary
                    ? "block text-sm text-white/80"
                    : "block text-sm text-white/50"
                }
              >
                {l.sub}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 font-mono text-xs text-white/40">
          solanasweeper.com
        </p>
      </div>
    </main>
  );
}
