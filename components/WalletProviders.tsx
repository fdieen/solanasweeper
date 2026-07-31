'use client';

import { useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

// Vul NEXT_PUBLIC_REOWN_PROJECT_ID in (.env.local) — fallback houdt build/SSR werkend
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

// metadata.url moet matchen met de pagina-URL (anders WalletConnect-warning):
// dev = de echte origin (localhost), prod = het productiedomein.
const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://solanasweeper.com';

const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Solana-wallets bovenaan pinnen (WalletConnect explorer-IDs)
const PHANTOM = 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393';
const SOLFLARE = '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79';

// AppKit één keer initialiseren — moet vóór de hooks gebeuren (ook tijdens SSR)
createAppKit({
  adapters: [solanaAdapter],
  networks: [solana],
  projectId,
  metadata: {
    name: 'SolanaSweeper',
    description: 'Clean your Solana wallet and reclaim locked SOL.',
    url: appUrl,
    // Wallets (Solflare/Phantom via WalletConnect) willen een VIERKANTE PNG (geen SVG,
    // geen woordmerk) op een absolute HTTPS-URL. appUrl is een absolute origin, dus dit
    // resolvet in productie naar https://solanasweeper.com/icon-512.png — en op een preview
    // naar de preview-origin, zodat het verbind-scherm daar getest kan worden.
    icons: [`${appUrl}/icon-512.png`],
  },
  // Degen-modus: directe wallet-keuze, geen email/socials
  features: {
    email: false,
    socials: false,
    emailShowWallets: false,
    onramp: false,
    swaps: false,
    analytics: true,
  },
  // Phantom/Solflare prominent; Backpack en overige wallets verschijnen via detectie
  featuredWalletIds: [PHANTOM, SOLFLARE],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#9945FF',
  },
});

export default function WalletProviders({ children }: { children: React.ReactNode }) {
  // Vang ALLEEN de bekende, niet-fatale WalletConnect IndexedDB-rejectie af
  // (treedt op bij dev/HMR-remounts) zodat hij niet als rode error in de console knalt.
  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason;
      const msg = (reason && (reason.message ?? String(reason))) || '';
      if (/indexed database server lost|indexeddb/i.test(String(msg))) {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);

  return <>{children}</>;
}
