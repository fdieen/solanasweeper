/**
 * Sweep-logica voor Fun Mode (close-only).
 * ----------------------------------------
 * Drie verbeteringen t.o.v. lib/funMode.ts:
 *  1. Verse state vlak vóór het bouwen van de tx (filtert al-gesloten / niet-lege accounts)
 *  2. Token-2022 withheld fees harvesten vóór closeAccount. lib/funMode.ts sloeg zulke
 *     accounts stilzwijgend over (filterClosable), waardoor die rent bleef staan.
 *  3. Preflight: saldo-check + simulatie vóór ondertekenen, met split-retry — een batch
 *     die faalt wordt gehalveerd i.p.v. in zijn geheel overgeslagen.
 *
 * Aangepast t.o.v. de aangeleverde versie, om te passen op deze codebase:
 *  - FEE_BPS komt uit lib/pricing (één bron van waarheid), niet hardcoded 500.
 *  - De fee-wallet komt als parameter mee uit NEXT_PUBLIC_FEE_WALLET i.p.v. een
 *    hardcoded adres, zodat een andere env niet stil naar de verkeerde wallet betaalt.
 *  - De fee loopt via addFeeInstructions, zodat de 25%-referral-split in dezelfde
 *    transactie blijft werken. Een kale transfer naar de fee-wallet zou het
 *    referral-programma stilzwijgend uitschakelen.
 *  - Meldingen in het Engels, net als de rest van de UI.
 *  - executeSweep is vervangen door planSweep: die tekent niet zelf, maar levert
 *    kant-en-klare transacties op. FunMode tekent ze in één keer met
 *    signAllTransactions (één wallet-approval i.p.v. één per batch), en dat kan
 *    alleen als preflight en split-retry vóór het tekenen gebeuren.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  type Blockhash,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  AccountLayout,
  ExtensionType,
  getExtensionData,
  createCloseAccountInstruction,
  createHarvestWithheldTokensToMintInstruction,
} from '@solana/spl-token';
import { addFeeInstructions } from './fees';
import { FEE_BPS } from './pricing';
import { CLOSE_FEE_ENABLED } from './funMode';

/* ── Config ── */
const MIN_WALLET_RESERVE = 1_000_000; // ~0.001 SOL, gelijk aan MIN_SOL_FOR_CLOSE
const CLOSES_PER_TX_MAX = 17;         // bewezen in productie
const CLOSES_PER_TX_WITH_HARVEST = 8; // harvest-ix kost extra ruimte
const MAX_SPLIT_DEPTH = 3;

/* ── Types ── */
export interface CloseableAccount {
  address: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  needsHarvest: boolean; // Token-2022 met withheld fees > 0
  rentLamports: number;
}

export type SkipReason = 'not_empty' | 'already_closed' | 'frozen' | 'preflight_failed';

export interface SkippedAccount {
  address: PublicKey;
  reason: SkipReason;
}

export interface ScanResult {
  closeable: CloseableAccount[];
  skipped: SkippedAccount[];
}

/* ── 1. Verse state ── */
/**
 * Haalt alle token accounts van de wallet op (Token + Token-2022) en houdt alleen
 * de écht lege over. Anders dan filterClosable in lib/funMode.ts worden Token-2022
 * accounts met withheld fees NIET overgeslagen: die krijgen needsHarvest, zodat
 * buildSweepTransaction er een harvest-instructie vóór de close zet.
 */
export async function scanCloseableAccounts(
  connection: Connection,
  owner: PublicKey,
): Promise<ScanResult> {
  const [legacy, t22] = await Promise.all([
    connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }, 'confirmed'),
    connection.getTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }, 'confirmed'),
  ]);

  const closeable: CloseableAccount[] = [];
  const skipped: SkippedAccount[] = [];

  for (const { pubkey, account } of [...legacy.value, ...t22.value]) {
    const data = AccountLayout.decode(account.data);
    const isT22 = account.owner.equals(TOKEN_2022_PROGRAM_ID);

    if (data.amount !== BigInt(0)) { skipped.push({ address: pubkey, reason: 'not_empty' }); continue; }
    if (data.state === 2) { skipped.push({ address: pubkey, reason: 'frozen' }); continue; }

    let needsHarvest = false;
    if (isT22) {
      const ext = getExtensionData(ExtensionType.TransferFeeAmount, account.data);
      if (ext) needsHarvest = ext.readBigUInt64LE(0) > BigInt(0);
    }

    closeable.push({
      address: pubkey,
      mint: new PublicKey(data.mint),
      programId: account.owner,
      needsHarvest,
      rentLamports: account.lamports,
    });
  }

  return { closeable, skipped };
}

/**
 * Herbevestigt vlak vóór ondertekenen dat de accounts nog bestaan en leeg zijn.
 * Voorkomt InvalidAccountData bij gebruikers die snel achter elkaar sweepen.
 */
export async function refreshBatch(
  connection: Connection,
  batch: CloseableAccount[],
): Promise<CloseableAccount[]> {
  const infos = await connection.getMultipleAccountsInfo(batch.map((a) => a.address), 'processed');
  return batch.filter((a, i) => {
    const info = infos[i];
    if (!info || info.data.length === 0) return false; // al gesloten
    if (!info.owner.equals(a.programId)) return false; // verkeerd programma
    return AccountLayout.decode(info.data).amount === BigInt(0);
  });
}

/* ── 2. Tx bouwen incl. harvest ── */
export function buildSweepTransaction(params: {
  owner: PublicKey;
  batch: CloseableAccount[];
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  referrer?: PublicKey | null;
  feeBps?: number;
  computeUnitPrice?: number;
}): Transaction {
  const {
    owner, batch, feeWallet, blockhash,
    referrer = null, feeBps = FEE_BPS, computeUnitPrice = 0,
  } = params;

  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 6_000 * batch.length + 20_000 }));
  if (computeUnitPrice > 0) {
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computeUnitPrice }));
  }

  // Harvests groeperen per mint: één instructie neemt meerdere accounts van dezelfde mint mee.
  const harvestByMint = new Map<string, PublicKey[]>();
  for (const a of batch) {
    if (!a.needsHarvest) continue;
    const key = a.mint.toBase58();
    harvestByMint.set(key, [...(harvestByMint.get(key) ?? []), a.address]);
  }
  for (const [mint, sources] of harvestByMint) {
    tx.add(
      createHarvestWithheldTokensToMintInstruction(new PublicKey(mint), sources, TOKEN_2022_PROGRAM_ID),
    );
  }

  // closeAccount: rent gaat naar de owner zelf
  for (const a of batch) {
    tx.add(createCloseAccountInstruction(a.address, owner, owner, [], a.programId));
  }

  // Fee over de teruggewonnen rent van DEZE batch. addFeeInstructions splitst bij een
  // geldige referrer 25%/75% binnen dezelfde transactie — niet vervangen door een
  // kale transfer, anders vervalt de referral-uitbetaling.
  const batchGross = batch.reduce((s, a) => s + a.rentLamports, 0);
  const batchFee = Math.floor((batchGross * feeBps) / 10_000);
  if (CLOSE_FEE_ENABLED && feeWallet && batchFee > 0) {
    addFeeInstructions(tx, owner, feeWallet, batchFee, referrer);
  }

  tx.feePayer = owner;
  tx.recentBlockhash = blockhash;
  return tx;
}

export function chunkBatches(accounts: CloseableAccount[]): CloseableAccount[][] {
  // Accounts die harvest nodig hebben in kleinere batches (extra instructies per account)
  const plain = accounts.filter((a) => !a.needsHarvest);
  const harvest = accounts.filter((a) => a.needsHarvest);
  const out: CloseableAccount[][] = [];
  for (let i = 0; i < plain.length; i += CLOSES_PER_TX_MAX) {
    out.push(plain.slice(i, i + CLOSES_PER_TX_MAX));
  }
  for (let i = 0; i < harvest.length; i += CLOSES_PER_TX_WITH_HARVEST) {
    out.push(harvest.slice(i, i + CLOSES_PER_TX_WITH_HARVEST));
  }
  return out;
}

/* ── 3. Preflight ── */
export class PreflightError extends Error {
  constructor(
    public code: 'insufficient_sol' | 'simulation_failed' | 'rpc_unavailable',
    msg: string,
    public logs?: string[],
  ) {
    super(msg);
    this.name = 'PreflightError';
  }
}

/** Eén tekst voor de hele klasse "RPC deed het niet" — nooit rauwe JSON in de UI. */
export const FEE_ESTIMATE_MESSAGE = 'Could not estimate fee, please retry.';

const BASE_FEE_PER_SIGNATURE = 5_000;

/**
 * Priority fee uit de ComputeBudget-instructies van de tx zelf, zodat de fallback
 * niet te laag uitkomt bij een sweep met computeUnitPrice > 0.
 * Data-layout: [2, u32 units] = SetComputeUnitLimit, [3, u64 microLamports] = SetComputeUnitPrice.
 */
function priorityFeeLamports(tx: Transaction): number {
  let units = 0;
  let microLamports = 0;
  for (const ix of tx.instructions) {
    if (!ix.programId.equals(ComputeBudgetProgram.programId)) continue;
    const d = ix.data;
    const view = new DataView(d.buffer, d.byteOffset, d.byteLength);
    if (d[0] === 2 && d.length >= 5) units = view.getUint32(1, true);
    else if (d[0] === 3 && d.length >= 9) microLamports = Number(view.getBigUint64(1, true));
  }
  if (!units || !microLamports) return 0;
  return Math.ceil((units * microLamports) / 1_000_000);
}

/**
 * Fee van de tx. Faalt getFeeForMessage (RPC down, methode geblokkeerd, blockhash
 * verlopen → value null), dan schatten we zelf: 5000 lamports per handtekening plus
 * de priority fee. Een mislukte schatting mag de sweep niet blokkeren.
 */
async function estimateTxFee(connection: Connection, tx: Transaction): Promise<number> {
  const message = tx.compileMessage();
  const fallback = BASE_FEE_PER_SIGNATURE * message.header.numRequiredSignatures + priorityFeeLamports(tx);
  try {
    const feeMsg = await connection.getFeeForMessage(message, 'confirmed');
    return feeMsg.value ?? fallback;
  } catch (e) {
    console.warn('[sweep] getFeeForMessage failed, using fallback estimate', e);
    return fallback;
  }
}

/**
 * Controleert saldo en simuleert de (nog niet getekende) transactie.
 * Gooit een PreflightError met een melding die direct in de UI kan.
 */
export async function preflight(
  connection: Connection,
  owner: PublicKey,
  tx: Transaction,
): Promise<void> {
  let balance: number;
  try {
    balance = await connection.getBalance(owner, 'processed');
  } catch (e) {
    console.error('[sweep] getBalance failed', e);
    throw new PreflightError('rpc_unavailable', FEE_ESTIMATE_MESSAGE);
  }
  const txFee = await estimateTxFee(connection, tx);

  // De sweep brengt zelf SOL binnen, dus alleen de tx-fee + reserve moet er nú al staan.
  if (balance < txFee + MIN_WALLET_RESERVE) {
    const need = ((txFee + MIN_WALLET_RESERVE - balance) / LAMPORTS_PER_SOL).toFixed(4);
    throw new PreflightError(
      'insufficient_sol',
      `Your wallet does not have enough SOL to pay the network fee. Add at least ${need} SOL and try again.`,
    );
  }

  let sim: Awaited<ReturnType<Connection['simulateTransaction']>>;
  try {
    sim = await connection.simulateTransaction(tx);
  } catch (e) {
    // Transport/proxy-fout (403 van de allowlist, netwerk, rate-limit) — geen
    // programmafout. Splitsen helpt hier niet; toon één leesbare melding.
    console.error('[sweep] simulateTransaction failed', e);
    throw new PreflightError('rpc_unavailable', FEE_ESTIMATE_MESSAGE);
  }
  if (sim.value.err) {
    throw new PreflightError(
      'simulation_failed',
      humanizeSimError(sim.value.err, sim.value.logs ?? []),
      sim.value.logs ?? undefined,
    );
  }
}

export function humanizeSimError(err: unknown, logs: string[]): string {
  const joined = logs.join('\n');
  if (joined.includes('withheld fee balance')) {
    return 'A Token-2022 account still has unharvested fees. Try again — the harvest step is added automatically.';
  }
  if (joined.includes('InvalidAccountData')) {
    return 'One of the accounts changed or was closed in the meantime. The list has been refreshed.';
  }
  if (joined.includes('insufficient lamports')) {
    return 'Not enough SOL to cover the fee transfer. Add a small amount and try again.';
  }
  if (JSON.stringify(err).includes('InsufficientFundsForRent')) {
    return 'This transaction would push your wallet below the rent minimum. Add about 0.002 SOL.';
  }
  // Geen rauwe JSON in de UI — het detail staat in de console voor debuggen.
  console.error('[sweep] simulation error', err, logs);
  return 'This sweep could not be prepared. Please retry in a moment.';
}

/**
 * Wallets die een tekenmethode niet ondersteunen. Trust via WalletConnect gooit
 * 'The method "solana_signAndSendTransaction" is not supported by the wallet'; Pro Mode
 * valt dan terug op signTransaction + sendRawTransaction. Kan de wallet ook dát niet,
 * dan komt de fout hier terecht en moet de gebruiker weten dat het aan de wallet ligt.
 */
function isUnsupportedWalletMethod(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e ?? '');
  return /not supported by the wallet|unsupported method|method not (found|supported)|cannot sign transactions|does not support sign/i.test(
    msg,
  );
}

/** True bij fouten die uit de RPC-laag komen (proxy-allowlist, netwerk, rate-limit). */
function isRpcTransportError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e ?? '');
  return /method not allowed|failed to get fee for message|rate limit|upstream rpc|origin not allowed|failed to fetch|fetch failed|network(error| request failed)|\b(403|429|502|503)\b/i.test(
    msg,
  );
}

/**
 * Eén plek waar een sweep-fout een UI-tekst wordt, zodat Fun Mode en Pro Mode
 * hetzelfde tonen — en nooit een rauwe JSON-dump.
 */
export function humanizeSweepError(e: unknown): string {
  if (e instanceof PreflightError) return e.message; // al gebruikersklaar
  // Vóór de cancel-check: een "not supported"-melding is geen weigering van de gebruiker.
  if (isUnsupportedWalletMethod(e)) {
    return "Your wallet doesn't support this signing method. Try Phantom, or another wallet that can sign this transaction.";
  }
  if (e instanceof Error && /reject|denied|user/i.test(e.message)) return 'You cancelled the signature.';
  if (isRpcTransportError(e)) return FEE_ESTIMATE_MESSAGE;
  return 'Something went wrong. No funds moved unless a transaction confirmed.';
}

/* ── Plannen: scan → chunk → refresh → preflight (met split-retry) ── */
export interface SweepPlan {
  transactions: Transaction[];
  batches: CloseableAccount[][];
  skipped: SkippedAccount[];
  /** Batches die na splitsen alsnog faalden; message is UI-klaar. */
  errors: string[];
}

/**
 * Bouwt alle transacties die getekend kunnen worden. Doet géén handtekening en
 * verstuurt niets — dat blijft bij de caller, zodat één signAllTransactions volstaat.
 *
 * Split-retry: faalt de simulatie van een batch, dan wordt die gehalveerd en opnieuw
 * geprobeerd (tot MAX_SPLIT_DEPTH). Zo verliest één rot account niet de hele batch.
 * Bij te weinig SOL heeft splitsen geen zin — die fout gaat direct omhoog.
 */
export async function planSweep(params: {
  connection: Connection;
  owner: PublicKey;
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  referrer?: PublicKey | null;
  computeUnitPrice?: number;
}): Promise<SweepPlan> {
  const { connection, ...rest } = params;
  const { closeable, skipped } = await scanCloseableAccounts(connection, params.owner);
  return planFromAccounts({ connection, ...rest, accounts: closeable, skipped });
}

/**
 * Zelfde planner, maar voor een aanroeper die de accounts al heeft. Pro Mode kent
 * zijn lege accounts al uit scanHoldings/classifyHoldings; die hoeft dus niet nóg
 * een scanCloseableAccounts te doen (dat zou twee RPC-rondes extra kosten).
 */
export async function planFromAccounts(params: {
  connection: Connection;
  owner: PublicKey;
  accounts: CloseableAccount[];
  feeWallet: PublicKey | null;
  blockhash: Blockhash;
  referrer?: PublicKey | null;
  computeUnitPrice?: number;
  /** Al bekende skips van de aanroeper; de planner vult aan. */
  skipped?: SkippedAccount[];
}): Promise<SweepPlan> {
  const {
    connection, owner, accounts, feeWallet, blockhash,
    referrer = null, computeUnitPrice,
  } = params;
  const skipped: SkippedAccount[] = [...(params.skipped ?? [])];
  const closeable = accounts;
  const transactions: Transaction[] = [];
  const batches: CloseableAccount[][] = [];
  const errors: string[] = [];

  const plan = async (batch: CloseableAccount[], depth = 0): Promise<void> => {
    const fresh = await refreshBatch(connection, batch);
    if (fresh.length === 0) {
      for (const a of batch) skipped.push({ address: a.address, reason: 'already_closed' });
      return;
    }

    const tx = buildSweepTransaction({
      owner, batch: fresh, feeWallet, blockhash, referrer, computeUnitPrice,
    });

    try {
      await preflight(connection, owner, tx);
    } catch (e) {
      const pe = e as PreflightError;
      // Splitsen lost geen saldo- of RPC-probleem op: direct omhoog.
      if (pe.code === 'insufficient_sol' || pe.code === 'rpc_unavailable') throw pe;
      if (fresh.length > 1 && depth < MAX_SPLIT_DEPTH) {
        const mid = Math.ceil(fresh.length / 2);
        await plan(fresh.slice(0, mid), depth + 1);
        await plan(fresh.slice(mid), depth + 1);
        return;
      }
      for (const a of fresh) skipped.push({ address: a.address, reason: 'preflight_failed' });
      errors.push(humanizeSweepError(e));
      return;
    }

    transactions.push(tx);
    batches.push(fresh);
  };

  for (const batch of chunkBatches(closeable)) await plan(batch);

  return { transactions, batches, skipped, errors };
}

/** Fee-berekening over een lijst CloseableAccounts, zelfde vorm als summarize() in funMode. */
export function summarizeCloseable(accounts: CloseableAccount[], feeBps = FEE_BPS) {
  const gross = accounts.reduce((s, a) => s + a.rentLamports, 0);
  const fee = Math.floor((gross * feeBps) / 10_000);
  return { count: accounts.length, grossLamports: gross, feeLamports: fee, netLamports: gross - fee };
}
