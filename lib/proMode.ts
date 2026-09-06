import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  type Blockhash,
} from '@solana/web3.js';
import {
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  createHarvestWithheldTokensToMintInstruction,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { hasValue, type TokenHolding, type Valuation } from './classify';
import { FEE_BPS } from './funMode';
import { addFeeInstructions } from './fees';

// burn + close = 2 instructies per account → kleinere batch dan bij Fun Mode
export const MAX_BURNS_PER_TX = 8;
// Token-2022 met withheld fees kost een harvest-ix extra (per mint) → kleinere batch,
// zelfde afweging als CLOSES_PER_TX_WITH_HARVEST in lib/sweep.ts.
export const MAX_BURNS_PER_TX_WITH_HARVEST = 5;

/**
 * Burn-fee schakelaar. De burn-tx int 10% van de teruggewonnen rent naar de
 * fee-wallet via een SystemProgram.transfer (zelfde model als Fun Mode).
 *
 * Stond tijdelijk op `false` (test, commit 2599453) om te isoleren of de
 * fee-transfer de Blowfish-trigger was — dat bleek NIET de oorzaak. Weer aan.
 */
export const BURN_FEE_ENABLED: boolean = true;

/** Geweigerd voor burn, met een UI-klare reden zodat de gebruiker per item ziet waarom. */
export type BurnRejection = { holding: TokenHolding; reason: string };

/**
 * BUILDER-SIDE HARD GUARD.
 * Weigert elk fungible token met route/prijs uit de burn-set — ongeacht wat de UI doorgeeft.
 * Ook compressed / frozen / al-lege accounts worden geweigerd.
 * NFTs zijn toegestaan (geen swap-route), maar komen alleen hier via expliciete opt-in upstream.
 */
export function filterBurnSafe(
  selected: TokenHolding[],
  valuations: Map<string, Valuation>
): { safe: TokenHolding[]; rejected: BurnRejection[] } {
  const safe: TokenHolding[] = [];
  const rejected: BurnRejection[] = [];
  for (const h of selected) {
    if (h.compressed) { rejected.push({ holding: h, reason: 'Compressed NFTs cannot be burned yet.' }); continue; }
    if (h.frozen) { rejected.push({ holding: h, reason: 'Account is frozen — the token program blocks burning.' }); continue; }
    if (h.amountRaw === '0') { rejected.push({ holding: h, reason: 'Account is already empty — nothing to burn.' }); continue; }
    const v = valuations.get(h.mint.toBase58());
    if (!h.isNft && hasValue(v)) {
      // Fungible token met route/prijs → NOOIT burnen
      rejected.push({ holding: h, reason: 'This token has market value — swap it instead of burning.' });
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
 * Eén burn-batch: eerst alle burnChecked (volledige balance), dan — voor Token-2022
 * accounts met openstaande withheld transfer-fees — harvestWithheldTokensToMint per
 * mint, en pas daarna de closeAccounts (rent → owner). Plus 10%-fee over de
 * teruggewonnen rent (zelfde model als Fun Mode).
 *
 * De harvest-stap is niet optioneel: closeAccount op een Token-2022 account met
 * withheld fees faalt met AccountHasWithheldTransferFees, waardoor de wallet de hele
 * batch weigert te versturen. Burnen zet de balance op 0 maar raakt het withheld-veld
 * niet aan — dat moet apart terug naar de mint. Zelfde logica als buildSweepTransaction
 * in lib/sweep.ts, alleen ná de burns i.p.v. op lege accounts.
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
  }

  // Withheld fees terug naar de mint vóór de closes, gegroepeerd per mint: één
  // instructie neemt meerdere accounts van dezelfde mint mee.
  const harvestByMint = new Map<string, PublicKey[]>();
  for (const h of accounts) {
    if (!h.needsHarvest || !h.programId.equals(TOKEN_2022_PROGRAM_ID)) continue;
    const k = h.mint.toBase58();
    harvestByMint.set(k, [...(harvestByMint.get(k) ?? []), h.tokenAccount]);
  }
  for (const [mint, sources] of harvestByMint) {
    tx.add(
      createHarvestWithheldTokensToMintInstruction(new PublicKey(mint), sources, TOKEN_2022_PROGRAM_ID)
    );
  }

  // accounts zijn nu leeg én zonder withheld fees → sluiten voor de rent
  for (const h of accounts) {
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
  // Harvest-accounts apart en in kleinere batches: die dragen een extra instructie per mint.
  const plain = accounts.filter((h) => !h.needsHarvest);
  const harvest = accounts.filter((h) => h.needsHarvest);
  const batches = [
    ...chunk(plain, maxPerTx),
    ...chunk(harvest, Math.min(maxPerTx, MAX_BURNS_PER_TX_WITH_HARVEST)),
  ];
  const transactions = batches.map((batch) =>
    buildBurnBatchTransaction({ owner, accounts: batch, feeWallet, blockhash, feeBps, computeUnitPrice, referrer })
  );
  return { transactions, batches };
}
