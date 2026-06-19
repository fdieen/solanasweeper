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
        {/* Canvas wrapper — position:fixed in JSX, nooit door JS overschreven */}
        <div
          id="canvas-wrapper"
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <canvas
            id="cube-canvas"
            style={{ display: 'block', width: '100%', height: '100%' }}
          />
        </div>

        {/* Content scroll container */}
        <div
          id="scroll-root"
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 10,
          }}
        >
          {children}
        </div>

        <CanvasBackground />
      </body>
    </html>
  );
}
