import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Classificatie voor Pro Mode.
 * Kernregel: een token met route/prijs/lijst komt NOOIT in de burn-bak.
 */

export type TokenHolding = {
  tokenAccount: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  amountRaw: string; // ruwe balance (string, geen floats)
  decimals: number;
  lamports: number;  // rent in het token-account (terug bij sluiten)
  frozen: boolean;
  /**
   * closeAuthority staat op een ander adres dan de owner: alleen die authority kan
   * het account sluiten, dus de rent is voor de gebruiker onbereikbaar. Zie
   * hasForeignCloseAuthority in lib/funMode.ts.
   */
  closeLocked?: boolean;
  isNft: boolean;
  compressed: boolean;
  name?: string;     // metadata (DAS) — voor de burn-UI (naam herkennen)
  image?: string;    // logo/afbeelding (DAS)
  /**
   * Token-2022 met openstaande withheld transfer-fees. Zo'n account is pas
   * sluitbaar nadat de fees geharvest zijn; buildSweepTransaction zet daarvoor
   * een harvest-instructie per mint vóór de closes. Zonder dat faalt de close
   * met 0x23. Wordt gezet in lib/holdings.ts uit dezelfde parsed accountdata.
   */
  needsHarvest?: boolean;
};

export type Valuation = {
  hasRoute: boolean;    // Jupiter kan naar SOL routen
  hasPrice: boolean;    // bekende prijs (Jupiter Price API)
  inTokenList: boolean; // staat in een (geverifieerde) tokenlijst
  outLamports?: number;
};

export type Category =
  | 'empty'           // amount 0 → Fun Mode (sluiten)
  | 'swap'            // heeft waarde → swappen, NOOIT burnen
  | 'burn'            // fungible junk → burn-kandidaat (opt-in)
  | 'nft'             // NFT → burn-kandidaat (opt-in), nooit swap
  | 'skip-frozen'     // bevroren → niet burn/close-baar
  | 'skip-close-locked' // vreemde closeAuthority → close faalt altijd (0x4)
  | 'skip-compressed';// compressed NFT → v1 uitgesloten

/** Een token heeft waarde zodra er een route, prijs, óf tokenlijst-vermelding is. */
export function hasValue(v: Valuation | undefined): boolean {
  if (!v) return false;
  return Boolean(v.hasRoute || v.hasPrice || v.inTokenList);
}

/**
 * Bepaalt de categorie van één token.
 * Belangrijk: zodra hasValue(v) → 'swap'. Een token met route/prijs kan
 * onmogelijk 'burn' worden (de waarde-check zit vóór de burn-uitkomst).
 */
export function classifyToken(h: TokenHolding, v: Valuation | undefined): Category {
  if (h.compressed) return 'skip-compressed'; // v1: cNFTs uitsluiten
  // Bevroren: niet te burnen. Leeg + klassiek Token-programma sluit wél (on-chain getoetst).
  if (h.frozen && !(h.amountRaw === '0' && h.programId.equals(TOKEN_PROGRAM_ID))) return 'skip-frozen';
  // Swappen kan nog (owner mag transfereren); sluiten/burn+close niet — de burn-tx
  // sluit het account erna en zou dus als geheel falen.
  if (h.closeLocked && (h.amountRaw === '0' || h.isNft || !hasValue(v))) return 'skip-close-locked';
  if (h.amountRaw === '0') return 'empty';      // Fun Mode
  if (h.isNft) return 'nft';                    // NFT → opt-in burn, nooit swap
  if (hasValue(v)) return 'swap';               // WAARDE → nooit burnen
  return 'burn';                                 // junk → opt-in burn-kandidaat
}

export type Buckets = {
  empty: TokenHolding[];
  swap: TokenHolding[];
  burn: TokenHolding[];
  nft: TokenHolding[];
  skipped: TokenHolding[];
};

export function classifyHoldings(
  holdings: TokenHolding[],
  valuations: Map<string, Valuation>
): Buckets {
  const b: Buckets = { empty: [], swap: [], burn: [], nft: [], skipped: [] };
  for (const h of holdings) {
    const v = valuations.get(h.mint.toBase58());
    switch (classifyToken(h, v)) {
      case 'empty': b.empty.push(h); break;
      case 'swap': b.swap.push(h); break;
      case 'burn': b.burn.push(h); break;
      case 'nft': b.nft.push(h); break;
      default: b.skipped.push(h); break;
    }
  }
  return b;
}
