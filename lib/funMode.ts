import {
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  type Blockhash,
} from '@solana/web3.js';
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

/* ── Constanten ── */
export const FEE_BPS = 1000;           // 10% (basispunten)
export const MAX_CLOSES_PER_TX = 20;   // veilige batchgrootte (tx-limiet 1232 bytes)
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Minimale SOL-balance (lamports) die de wallet moet hebben om de tx te kunnen
// laten simuleren/betalen. Onder deze drempel bestaat de fee-payer feitelijk
// niet → Phantom's simulatie faalt met "AccountNotFound" en toont een rode
// warning. We vangen dat vóór de tx af met een eigen vriendelijke melding.
// Tunebaar: verhoog/verlaag indien nodig.
export const MIN_SOL_FOR_GAS = 5_000_000; // 0.005 SOL

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
}): Transaction {
  const { owner, accounts, feeWallet, blockhash, feeBps = FEE_BPS, computeUnitPrice = 0 } = params;

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
  if (feeWallet && batchFee > 0) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: feeWallet,
        lamports: batchFee,
      })
    );
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
}): { transactions: Transaction[]; batches: ClosableAccount[][] } {
  const { owner, accounts, feeWallet, blockhash, maxPerTx = MAX_CLOSES_PER_TX, feeBps, computeUnitPrice } = params;
  const batches = chunk(accounts, maxPerTx);
  const transactions = batches.map((batch) =>
    buildBatchTransaction({ owner, accounts: batch, feeWallet, blockhash, feeBps, computeUnitPrice })
  );
  return { transactions, batches };
}
