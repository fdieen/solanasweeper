import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  type Blockhash,
} from '@solana/web3.js';
import { createBurnCheckedInstruction, createCloseAccountInstruction } from '@solana/spl-token';
import { hasValue, type TokenHolding, type Valuation } from './classify';
import { FEE_BPS } from './funMode';
import { addFeeInstructions } from './fees';

// burn + close = 2 instructies per account → kleinere batch dan bij Fun Mode
export const MAX_BURNS_PER_TX = 8;

/**
 * Burn-fee schakelaar. De burn-tx int 10% van de teruggewonnen rent naar de
 * fee-wallet via een SystemProgram.transfer (zelfde model als Fun Mode).
 *
 * Stond tijdelijk op `false` (test, commit 2599453) om te isoleren of de
 * fee-transfer de Blowfish-trigger was — dat bleek NIET de oorzaak. Weer aan.
 */
export const BURN_FEE_ENABLED: boolean = true;

/**
 * BUILDER-SIDE HARD GUARD.
 * Weigert elk fungible token met route/prijs uit de burn-set — ongeacht wat de UI doorgeeft.
 * Ook compressed / frozen / al-lege accounts worden geweigerd.
 * NFTs zijn toegestaan (geen swap-route), maar komen alleen hier via expliciete opt-in upstream.
 */
export function filterBurnSafe(
  selected: TokenHolding[],
  valuations: Map<string, Valuation>
): { safe: TokenHolding[]; rejected: TokenHolding[] } {
  const safe: TokenHolding[] = [];
  const rejected: TokenHolding[] = [];
  for (const h of selected) {
    if (h.compressed || h.frozen || h.amountRaw === '0') {
      rejected.push(h);
      continue;
    }
    const v = valuations.get(h.mint.toBase58());
    if (!h.isNft && hasValue(v)) {
      // Fungible token met route/prijs → NOOIT burnen
      rejected.push(h);
      continue;
    }
    safe.push(h);
  }
  return { safe, rejected };
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Eén burn-batch: per account burnChecked(volledige balance) → closeAccount (rent → owner),
 * plus 10%-fee over de teruggewonnen rent (zelfde model als Fun Mode).
 */
export function buildBurnBatchTransaction(params: {
  owner: PublicKey;
  accounts: TokenHolding[]; // één chunk (al door filterBurnSafe gehaald)
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  feeBps?: number;
  computeUnitPrice?: number;
  referrer?: PublicKey | null;
}): Transaction {
  const { owner, accounts, feeWallet, blockhash, feeBps = FEE_BPS, computeUnitPrice = 0, referrer = null } = params;

  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }));
  if (computeUnitPrice > 0) {
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computeUnitPrice }));
  }

  for (const h of accounts) {
    // burnChecked verifieert mint + decimals on-chain (extra vangnet)
    tx.add(
      createBurnCheckedInstruction(
        h.tokenAccount,
        h.mint,
        owner,
        BigInt(h.amountRaw),
        h.decimals,
        [],
        h.programId
      )
    );
    // account is nu leeg → sluiten voor de rent
    tx.add(createCloseAccountInstruction(h.tokenAccount, owner, owner, [], h.programId));
  }

  const batchGross = accounts.reduce((s, a) => s + a.lamports, 0);
  const batchFee = Math.floor((batchGross * feeBps) / 10_000);
  // Fee-transfer alleen wanneer BURN_FEE_ENABLED aan staat. Bij een geldige referrer
  // splitst addFeeInstructions 25%/75% (referrer/fee-wallet).
  if (BURN_FEE_ENABLED && feeWallet && batchFee > 0) {
    addFeeInstructions(tx, owner, feeWallet, batchFee, referrer);
  }

  tx.feePayer = owner;
  tx.recentBlockhash = blockhash;
  return tx;
}

/** Bouw alle burn-batches uit een reeds-veilig-gefilterde set. */
export function buildBurnBatches(params: {
  owner: PublicKey;
  accounts: TokenHolding[];
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  maxPerTx?: number;
  feeBps?: number;
  computeUnitPrice?: number;
  referrer?: PublicKey | null;
}): { transactions: Transaction[]; batches: TokenHolding[][] } {
  const { owner, accounts, feeWallet, blockhash, maxPerTx = MAX_BURNS_PER_TX, feeBps, computeUnitPrice, referrer = null } = params;
  const batches = chunk(accounts, maxPerTx);
  const transactions = batches.map((batch) =>
    buildBurnBatchTransaction({ owner, accounts: batch, feeWallet, blockhash, feeBps, computeUnitPrice, referrer })
  );
  return { transactions, batches };
}
