'use client';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Vul NEXT_PUBLIC_REOWN_PROJECT_ID in (.env.local) — fallback houdt build/SSR werkend
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

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
    name: 'SolSweep',
    description: 'Clean your Solana wallet and reclaim locked SOL.',
    url: 'https://solsweep.io',
    icons: ['https://solsweep.io/logo.svg'],
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
  return <>{children}</>;
}
