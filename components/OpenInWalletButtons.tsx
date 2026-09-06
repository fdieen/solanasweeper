'use client';

import { useSyncExternalStore } from 'react';
import { track } from '@vercel/analytics';

/**
 * "Open in Phantom" / "Open in Solflare" — alleen op mobiel én alleen als er geen
 * Solana-provider in de browser zit.
 *
 * Waarom: op een mobiele browser zonder wallet-app-context doet de connect-knop niets
 * nuttigs (WalletConnect-QR op hetzelfde scherm scannen kan niet). De deeplink opent
 * dezelfde pagina in de in-app browser van de wallet, waar wél een provider zit.
 *
 * De deeplink krijgt de VOLLEDIGE huidige URL mee, inclusief query-string, zodat een
 * ?ref=<wallet> uit een referral-link niet verdwijnt bij de overstap naar de wallet-app.
 * Let op de dubbele betekenis van "ref": de ?ref= áchter de deeplink is die van Phantom/
 * Solflare zelf (de verwijzende app), niet onze referral-parameter. Die van ons zit
 * percent-encoded ín het eerste deel en blijft dus intact.
 */

const MOBILE_QUERY = '(max-width: 767px)';

const PHANTOM_BROWSE = 'https://phantom.app/ul/browse/';
const SOLFLARE_BROWSE = 'https://solflare.com/ul/v1/browse/';

type InjectedWindow = Window & {
  phantom?: { solana?: unknown };
  solflare?: unknown;
  solana?: unknown;
  backpack?: unknown;
};

/** Zit er al een wallet in deze browser? Dan is de deeplink alleen maar in de weg. */
function hasInjectedProvider(): boolean {
  const w = window as InjectedWindow;
  return Boolean(w.phantom?.solana || w.solflare || w.solana || w.backpack);
}

/* useSyncExternalStore i.p.v. useState + useEffect: geen setState in een effect (extra
 * renderronde, en de react-hooks-regel klaagt terecht), en geen hydration-mismatch —
 * de server rendert niets en de client beslist erna. */
function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  // Een extensie die zich ná hydration registreert (Wallet Standard) verbergt de knoppen alsnog.
  window.addEventListener('wallet-standard:register-wallet', onChange);
  return () => {
    mql.removeEventListener('change', onChange);
    window.removeEventListener('wallet-standard:register-wallet', onChange);
  };
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches && !hasInjectedProvider();
const getServerSnapshot = () => false;

/** Deeplink naar de in-app browser van de wallet, met onze volledige URL erin. */
function deeplink(base: string): string {
  const target = encodeURIComponent(window.location.href);
  const referrer = encodeURIComponent(window.location.origin);
  return `${base}${target}?ref=${referrer}`;
}

export default function OpenInWalletButtons() {
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!show) return null;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'stretch', gap: '8px',
        width: '100%', maxWidth: '360px', marginBottom: '12px',
      }}
    >
      <a
        href={deeplink(PHANTOM_BROWSE)}
        onClick={() => track('open_in_wallet', { wallet: 'phantom' })}
        rel="noopener noreferrer"
        style={{
          flex: 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
          minHeight: '46px', padding: '12px 18px',
          fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.92rem',
          color: '#fff', textDecoration: 'none',
          background: 'rgba(153,69,255,0.16)',
          border: '1px solid rgba(171,159,242,0.45)',
          borderRadius: '999px',
        }}
      >
        <GhostIcon />
        Open in Phantom
      </a>

      <a
        href={deeplink(SOLFLARE_BROWSE)}
        onClick={() => track('open_in_wallet', { wallet: 'solflare' })}
        rel="noopener noreferrer"
        aria-label="Open in Solflare"
        style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          minHeight: '46px', padding: '12px 15px',
          fontFamily: 'General Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.72)', textDecoration: 'none',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '999px',
        }}
      >
        <FlareIcon />
        Solflare
      </a>
    </div>
  );
}

/* Eigen, monochrome glyphs (currentColor) — herkenbaar als wallet-icoon zonder de
 * merklogo's van Phantom/Solflare na te maken. */
function GhostIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M8 1.6c3 0 5.1 2.2 5.1 5.2v6.1c0 .7-.8 1.1-1.3.6l-.9-.8-1 .9c-.4.3-.9.3-1.3 0l-.9-.8-.9.8c-.4.3-.9.3-1.3 0l-1-.9-.9.8c-.5.5-1.3.1-1.3-.6V6.8c0-3 2.1-5.2 5.1-5.2Z"
        fill="currentColor" opacity="0.9"
      />
      <circle cx="6.2" cy="6.6" r="0.95" fill="#1a1030" />
      <circle cx="9.9" cy="6.6" r="0.95" fill="#1a1030" />
    </svg>
  );
}

function FlareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="3.1" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.75">
        <path d="M8 1.4v1.6M8 13v1.6M1.4 8h1.6M13 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" />
      </g>
    </svg>
  );
}
