import { PublicKey, SystemProgram, type Transaction } from '@solana/web3.js';

/**
 * Fee-split voor het referral-programma.
 * Standaard gaat 100% van de platform-fee naar de fee-wallet. Is er een geldige referrer,
 * dan gaat 25% van de fee naar de referrer en 75% naar de fee-wallet — mits het referrer-
 * aandeel ≥ MIN_REFERRER_LAMPORTS is (anders is het te klein om te loont en gaat 100% naar
 * de fee-wallet). De referrer-validatie (base58 + account bestaat + niet de wallet zelf)
 * gebeurt vóór dit punt, in de sweep-flow.
 */
export const REFERRER_BPS = 2500;          // 25% van de fee
export const MIN_REFERRER_LAMPORTS = 5000; // minimaal referrer-aandeel om te splitsen

export type FeeSplit = { feeLamports: number; referrerLamports: number };

export function splitFee(batchFee: number, referrer: PublicKey | null): FeeSplit {
  if (!referrer || batchFee <= 0) return { feeLamports: batchFee, referrerLamports: 0 };
  const referrerLamports = Math.floor((batchFee * REFERRER_BPS) / 10_000);
  if (referrerLamports < MIN_REFERRER_LAMPORTS) {
    return { feeLamports: batchFee, referrerLamports: 0 };
  }
  return { feeLamports: batchFee - referrerLamports, referrerLamports };
}

/**
 * Voegt de fee-instructie(s) toe aan een tx: transfer naar de fee-wallet, en — bij een
 * geldige referrer met voldoende aandeel — een tweede transfer naar de referrer.
 * Retourneert het feitelijke aandeel dat naar de referrer ging (voor tracking).
 */
export function addFeeInstructions(
  tx: Transaction,
  owner: PublicKey,
  feeWallet: PublicKey,
  batchFee: number,
  referrer: PublicKey | null,
): { referrerLamports: number } {
  const { feeLamports, referrerLamports } = splitFee(batchFee, referrer);
  if (feeLamports > 0) {
    tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: feeWallet, lamports: feeLamports }));
  }
  if (referrer && referrerLamports > 0) {
    tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: referrer, lamports: referrerLamports }));
  }
  return { referrerLamports };
}
