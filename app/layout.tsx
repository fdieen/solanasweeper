import type { Metadata } from "next";
import "./globals.css";
import CanvasBackground from "@/components/CanvasBackground";

export const metadata: Metadata = {
  title: "SolSweep — Reclaim Your SOL",
  description: "Clean your Solana wallet. Close empty token accounts, burn junk, and reclaim locked SOL in one click.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CanvasBackground />
        {children}
      </body>
    </html>
  );
}
