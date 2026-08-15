// Enige bron voor de platform-fee. Bewust ZONDER web3.js-import (of andere zware deps),
// zodat ook client components (bv. de FAQ-tekst) dit kunnen gebruiken zonder web3.js
// in de client-bundle te trekken. Wijzig FEE_BPS → tx-fee, schema én UI-tekst volgen.
export const FEE_BPS = 1000; // 10% in basispunten
export const FEE_PERCENT = FEE_BPS / 100; // 10 — voor UI-tekst en structured data
