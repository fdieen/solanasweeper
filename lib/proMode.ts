import {
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  type Blockhash,
} from '@solana/web3.js';
import { createBurnCheckedInstruction, createCloseAccountInstruction } from '@solana/spl-token';
import { hasValue, type TokenHolding, type Valuation } from './classify';
import { FEE_BPS } from './funMode';

// burn + close = 2 instructies per account → kleinere batch dan bij Fun Mode
export const MAX_BURNS_PER_TX = 8;

/**
 * ⚠ TIJDELIJKE TEST-FLAG — NA DE TEST TERUGZETTEN OP `true`.
 *
 * Op `false` bevat de burn-tx GEEN SystemProgram.transfer naar de fee-wallet meer,
 * alleen burnChecked + closeAccount → owner. Doel: isoleren of Phantom/Blowfish
 * flagt op de fee-transfer (value-out naar third-party) of op de burn zelf.
 *
 * TERUGZETTEN = deze waarde weer op `true` zetten (één regel). De fee-logica
 * eronder blijft intact, dus de netto 10% komt direct terug.
 */
export const BURN_FEE_ENABLED: boolean = false;

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
}): Transaction {
  const { owner, accounts, feeWallet, blockhash, feeBps = FEE_BPS, computeUnitPrice = 0 } = params;

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
  // BURN_FEE_ENABLED tijdelijk false (test): geen value-out naar de fee-wallet in de burn-tx.
  if (BURN_FEE_ENABLED && feeWallet && batchFee > 0) {
    tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: feeWallet, lamports: batchFee }));
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
}): { transactions: Transaction[]; batches: TokenHolding[][] } {
  const { owner, accounts, feeWallet, blockhash, maxPerTx = MAX_BURNS_PER_TX, feeBps, computeUnitPrice } = params;
  const batches = chunk(accounts, maxPerTx);
  const transactions = batches.map((batch) =>
    buildBurnBatchTransaction({ owner, accounts: batch, feeWallet, blockhash, feeBps, computeUnitPrice })
  );
  return { transactions, batches };
}
