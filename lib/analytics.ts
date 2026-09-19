/**
 * Funnel-events, één aanroep, twee bestemmingen.
 *
 * De site stuurde zijn custom events (wallet_connected, scan_completed, sweep_signed,
 * sweep_confirmed, open_in_wallet) alleen naar Vercel Analytics. Google Analytics 4 staat
 * er nu naast: Vercel is sterk in de funnel zelf, GA4 in acquisitie (welk kanaal, welke
 * zoekterm, welke campagne leverde een sweep op) en in de koppeling met Search Console.
 *
 * Door hier één `track` te exporteren met exact dezelfde signatuur als die van
 * `@vercel/analytics`, hoefden de call sites alleen hun import te wijzigen en blijven de
 * eventnamen in beide systemen identiek. Wie er later een derde bestemming bij wil, doet
 * dat op deze plek en nergens anders.
 *
 * Fire-and-forget, net als lib/events.ts: analytics mag een sweep nooit ophouden of laten
 * falen, dus beide aanroepen zitten in hun eigen try/catch. `window.gtag` is optioneel —
 * die bestaat niet in `next dev` (zie app/layout.tsx), niet vóór hydration en niet bij
 * bezoekers met een adblocker. De optional call maakt het dan een stille no-op.
 *
 * Let op bij nieuwe events: GA4 wil snake_case, maximaal 40 tekens per eventnaam en
 * maximaal 25 parameters. Stuur alleen aggregaten, nooit een walletadres — dat is
 * pseudonieme persoonsdata en het zou bovendien de GA4-voorwaarden schenden.
 */

import { track as vercelTrack } from '@vercel/analytics';

/** Zelfde toegestane waarden als Vercel Analytics accepteert. */
export type EventProps = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    /** Gezet door het init-script van <GoogleAnalytics> uit @next/third-parties. */
    gtag?: (command: 'event', name: string, params?: EventProps) => void;
  }
}

export function track(name: string, props?: EventProps): void {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics mag nooit de flow breken */
  }

  try {
    if (typeof window !== 'undefined') window.gtag?.('event', name, props);
  } catch {
    /* idem */
  }
}
