import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { FEE_BPS } from './pricing';

/* ── Constanten ── */
export { FEE_BPS };                     // fee-bron staat in lib/pricing.ts (web3.js-vrij)
export const MAX_CLOSES_PER_TX = 20;   // veilige batchgrootte (tx-limiet 1232 bytes)
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Minimale SOL-balance (lamports) die de wallet moet hebben om de tx te kunnen
// laten simuleren/betalen. Onder deze drempel bestaat de fee-payer feitelijk
// niet → Phantom's simulatie faalt met "AccountNotFound" en toont een rode
// warning. We vangen dat vóór de tx af met een eigen vriendelijke melding.
// Twee drempels omdat de kosten per pad verschillen; tunebaar indien nodig:
//  - CLOSE/BURN: alleen de base fee (5.000 lamports/tx, geen priority fee) → ruime marge op 0,001 SOL.
//  - SWAP (Jupiter): wrapAndUnwrapSol maakt een transient wSOL-account; het SPL token-account
//    rent-exempt minimum is 2.039.280 lamports, dus 2M is te laag → 0,003 SOL.
export const MIN_SOL_FOR_CLOSE = 1_000_000; // 0.001 SOL — close/burn (base fee only)
export const MIN_SOL_FOR_SWAP = 3_000_000;  // 0.003 SOL — Jupiter-swap (transient wSOL rent + marge)

/**
 * Close-fee schakelaar (analoog aan BURN_FEE_ENABLED voor burns). De close-tx int
 * 10% van de teruggewonnen rent naar de fee-wallet via een SystemProgram.transfer.
 *
 * Stond tijdelijk op `false` (test, commit eb78374) om te isoleren of Phantom/
 * Blowfish de close-only-tx op schaal flagt vanwege de fee-transfer. Weer aan.
 */
export const CLOSE_FEE_ENABLED: boolean = true;

export { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID };

/* ── Types ── */
export type ClosableAccount = {
  pubkey: PublicKey;
  programId: PublicKey;
  lamports: number; // rent die terugkomt bij sluiten
  /**
   * Token-2022 met openstaande withheld transfer-fees. Zulke accounts zijn pas
   * sluitbaar ná een harvest-instructie; lib/sweep.ts (planSweep) doet dat.
   * Ze tellen wél mee in de scan en de reclaimable-som — vroeger werden ze
   * stilzwijgend weggefilterd, waardoor die rent onzichtbaar bleef.
   */
  needsHarvest?: boolean;
};

export type Summary = {
  count: number;
  grossLamports: number;
  feeLamports: number;
  netLamports: number;
};

// Losse vorm van een item uit getParsedTokenAccountsByOwner().value
type ParsedTokenItem = {
  pubkey: PublicKey;
  account: {
    lamports: number;
    data: {
      parsed?: {
        info?: {
          tokenAmount?: { amount?: string };
          state?: string;
          extensions?: Array<{
            extension?: string;
            state?: { withheldAmount?: string };
          }>;
        };
      };
    };
  };
};

/* ── Filter: ALLEEN écht lege, sluitbare accounts ──
 * - ruwe amount === "0" (string, geen floats)
 * - niet 'frozen'
 * - Token-2022 met openstaande withheld transfer-fees wordt NIET meer weggegooid:
 *   die krijgt needsHarvest en is sluitbaar zodra planSweep er een harvest vóór zet.
 *   Zo telt die rent mee in de checker i.p.v. onzichtbaar te blijven.
 */
export function filterClosable(
  items: ParsedTokenItem[],
  programId: PublicKey
): ClosableAccount[] {
  const out: ClosableAccount[] = [];
  for (const item of items) {
    const info = item.account?.data?.parsed?.info;
    if (!info) continue;

    if (info.tokenAmount?.amount !== '0') continue; // niet leeg
    if (info.state === 'frozen') continue;           // bevroren → niet sluitbaar

    // Token-2022: openstaande withheld transfer-fees moeten eerst geharvest worden.
    // De parsed accountdata hebben we hier al, dus dit kost geen extra RPC-ronde.
    const hasWithheld = (info.extensions ?? []).some(
      (e) =>
        e.extension === 'transferFeeAmount' &&
        e.state?.withheldAmount !== undefined &&
        e.state.withheldAmount !== '0'
    );

    out.push({
      pubkey: item.pubkey,
      programId,
      lamports: item.account.lamports,
      needsHarvest: hasWithheld,
    });
  }
  return out;
}

/* ── Hulp ── */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function summarize(accounts: ClosableAccount[], feeBps = FEE_BPS): Summary {
  const gross = accounts.reduce((s, a) => s + a.lamports, 0);
  const fee = Math.floor((gross * feeBps) / 10_000);
  return {
    count: accounts.length,
    grossLamports: gross,
    feeLamports: fee,
    netLamports: gross - fee,
  };
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/* Bouwen van close-transacties zit in lib/sweep.ts (buildSweepTransaction +
 * planFromAccounts). buildBatchTransaction/buildBatches stonden hier, maar hadden
 * geen harvest-instructie voor Token-2022 en een eigen batchgrootte; Fun Mode en
 * Pro Mode gebruiken nu dezelfde bouwer, zodat ze niet uit elkaar kunnen lopen. */
