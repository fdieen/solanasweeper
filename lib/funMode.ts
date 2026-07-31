import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  type Blockhash,
} from '@solana/web3.js';
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { addFeeInstructions } from './fees';

/* ── Constanten ── */
export const FEE_BPS = 1000;           // 10% (basispunten)
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
 * - Token-2022: geen openstaande withheld transfer-fees (anders kan sluiten falen)
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

    // Token-2022: withheld transfer fees blokkeren sluiten
    const hasWithheld = (info.extensions ?? []).some(
      (e) =>
        e.extension === 'transferFeeAmount' &&
        e.state?.withheldAmount !== undefined &&
        e.state.withheldAmount !== '0'
    );
    if (hasWithheld) continue;

    out.push({
      pubkey: item.pubkey,
      programId,
      lamports: item.account.lamports,
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

/* ── Bouw één batch-transactie ──
 * compute budget + N×closeAccount (rent → owner) + 10%-transfer (owner → fee-wallet).
 * Alles atomair: closes en fee zitten in dezelfde tx.
 */
export function buildBatchTransaction(params: {
  owner: PublicKey;
  accounts: ClosableAccount[]; // één chunk
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  feeBps?: number;
  computeUnitPrice?: number; // microLamports priority fee (optioneel)
  referrer?: PublicKey | null; // gevalideerde referrer (base58 + bestaat + niet self)
}): Transaction {
  const { owner, accounts, feeWallet, blockhash, feeBps = FEE_BPS, computeUnitPrice = 0, referrer = null } = params;

  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }));
  if (computeUnitPrice > 0) {
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computeUnitPrice }));
  }

  // closeAccount: rent gaat naar de owner zelf
  for (const acc of accounts) {
    tx.add(createCloseAccountInstruction(acc.pubkey, owner, owner, [], acc.programId));
  }

  // 10% fee over de teruggewonnen rent van DEZE batch
  const batchGross = accounts.reduce((s, a) => s + a.lamports, 0);
  const batchFee = Math.floor((batchGross * feeBps) / 10_000);
  // Fee-transfer alleen wanneer CLOSE_FEE_ENABLED aan staat (zie constante hierboven).
  // Bij een geldige referrer splitst addFeeInstructions 25%/75% (referrer/fee-wallet).
  if (CLOSE_FEE_ENABLED && feeWallet && batchFee > 0) {
    addFeeInstructions(tx, owner, feeWallet, batchFee, referrer);
  }

  tx.feePayer = owner;
  tx.recentBlockhash = blockhash;
  return tx;
}

/* ── Bouw alle batches ── */
export function buildBatches(params: {
  owner: PublicKey;
  accounts: ClosableAccount[];
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  maxPerTx?: number;
  feeBps?: number;
  computeUnitPrice?: number;
  referrer?: PublicKey | null;
}): { transactions: Transaction[]; batches: ClosableAccount[][] } {
  const { owner, accounts, feeWallet, blockhash, maxPerTx = MAX_CLOSES_PER_TX, feeBps, computeUnitPrice, referrer = null } = params;
  const batches = chunk(accounts, maxPerTx);
  const transactions = batches.map((batch) =>
    buildBatchTransaction({ owner, accounts: batch, feeWallet, blockhash, feeBps, computeUnitPrice, referrer })
  );
  return { transactions, batches };
}
