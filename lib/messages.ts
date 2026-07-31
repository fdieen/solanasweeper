// Gedeelde, gebruiker-zichtbare meldingen (UI-copy). Bewust los van de tx-logica.

/**
 * Rustige melding wanneer de wallet te weinig SOL heeft voor de netwerk-fee
 * (balance < de meegegeven drempel — MIN_SOL_FOR_CLOSE of MIN_SOL_FOR_SWAP, zie
 * lib/funMode.ts) op het moment van sweepen. Wordt in FunMode en ProMode
 * conditioneel getoond via {noticeMsg && ...}. Het bedrag wordt uit de drempel
 * afgeleid en als SOL met 3 decimalen getoond (punt als decimaalteken).
 */
export function lowGasNotice(minLamports: number): string {
  const sol = (minLamports / 1_000_000_000).toFixed(3);
  return `Your wallet needs a small amount of SOL to cover the network fee (~${sol}). Add a little SOL and try again.`;
}
