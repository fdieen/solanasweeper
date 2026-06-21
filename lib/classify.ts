import { PublicKey } from '@solana/web3.js';

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
  isNft: boolean;
  compressed: boolean;
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
  if (h.frozen) return 'skip-frozen';          // niet burn/close-baar
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
