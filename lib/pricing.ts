// Enige bron voor de platform-fee. Bewust ZONDER web3.js-import (of andere zware deps),
// zodat ook client components (bv. de FAQ-tekst) dit kunnen gebruiken zonder web3.js
// in de client-bundle te trekken. Wijzig FEE_BPS → tx-fee, schema én UI-tekst volgen.
export const FEE_BPS = 1000; // 10% in basispunten
export const FEE_PERCENT = FEE_BPS / 100; // 10 — voor UI-tekst en structured data

/**
 * SOL-bedrag voor de UI. Vier decimalen zolang het bedrag daar zichtbaar is
 * (≥ 0.0001 SOL), daaronder zes — een referral-aandeel van 0.000051 SOL las als
 * "0.0000 SOL" en leek daarmee nul, terwijl het wel degelijk wordt uitbetaald.
 * Alleen weergave: de fee-split en de payout-registratie rekenen in lamports.
 */
export function formatSol(sol: number): string {
  return sol >= 0.0001 ? sol.toFixed(4) : sol.toFixed(6);
}
