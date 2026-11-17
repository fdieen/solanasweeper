import { Connection, PublicKey } from '@solana/web3.js';
import { filterClosable, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, type ClosableAccount } from './funMode';

/**
 * Connection die via onze beveiligde /api/rpc proxy praat (Helius achter de key).
 * WebSocket is uitgeschakeld — we bevestigen via HTTP-polling (getSignatureStatuses).
 */
export function getProxyConnection(): Connection {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return new Connection(`${origin}/api/rpc`, {
    commitment: 'confirmed',
    // geen wsEndpoint → geen subscriptions; we pollen zelf
    disableRetryOnRateLimit: true,
  });
}

/** Verse, gezaghebbende fetch van sluitbare accounts (SPL + Token-2022). */
export async function scanClosable(
  connection: Connection,
  owner: PublicKey
): Promise<ClosableAccount[]> {
  const spl = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
  let t22Value: typeof spl.value = [];
  try {
    const t22 = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID });
    t22Value = t22.value;
  } catch {
    // Token-2022 niet beschikbaar — negeren
  }
  return [
    ...filterClosable(spl.value as never, TOKEN_PROGRAM_ID),
    ...filterClosable(t22Value as never, TOKEN_2022_PROGRAM_ID),
  ];
}

/**
 * Verse blockhash vlak vóór het tekenen. Een blockhash is ~150 blocks (60–90 s) geldig;
 * plannen + preflight + de wallet-popup kunnen daar samen overheen gaan. Let op:
 * simulateTransaction() van web3.js vervangt bij legacy-transacties zelf de blockhash,
 * dus een verlopen blockhash valt in onze simulatie NIET op — pas bij het versturen.
 */
export async function freshBlockhash(connection: Connection) {
  return connection.getLatestBlockhash('confirmed');
}

/** True als transacties met deze lastValidBlockHeight niet meer kunnen landen. */
export async function blockhashExpired(connection: Connection, lastValidBlockHeight: number): Promise<boolean> {
  try {
    return (await connection.getBlockHeight('confirmed')) > lastValidBlockHeight;
  } catch {
    return false; // bij twijfel gewoon proberen; de node weigert hem dan zelf
  }
}

/**
 * Bevestig meerdere transacties tegelijk met één getSignatureStatuses-call per ronde
 * (max 256 signatures). Stopt pas als alles beslist is: bevestigd, mislukt, of de
 * blockhash is aantoonbaar verlopen. Geeft per signature true/false terug.
 *
 * Vroeger pollde elke tx 45 s los. Transacties die net daarna landden werden als
 * "not confirmed" gelogd en gemeld terwijl de SOL wél terug was.
 */
export async function pollConfirmMany(
  connection: Connection,
  signatures: string[],
  lastValidBlockHeight?: number,
  { intervalMs = 1500, maxMs = 120_000 }: { intervalMs?: number; maxMs?: number } = {},
): Promise<boolean[]> {
  const result: (boolean | null)[] = signatures.map(() => null);
  const openIdx = () => result.map((r, i) => (r === null ? i : -1)).filter((i) => i >= 0);
  const started = Date.now();
  let round = 0;
  while (openIdx().length > 0) {
    const open = openIdx();
    try {
      const { value } = await connection.getSignatureStatuses(open.map((i) => signatures[i]));
      value.forEach((st, k) => {
        if (!st) return;
        if (st.err) result[open[k]] = false;
        else if (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized') result[open[k]] = true;
      });
    } catch {
      // tijdelijke fout → blijven pollen
    }
    if (openIdx().length === 0) break;
    // Elke 4 rondes: is de blockhash verlopen, dan kan er niets meer landen. Nog één
    // laatste status-check met history, dan is het antwoord definitief.
    round++;
    const timedOut = Date.now() - started > maxMs;
    const expired = !timedOut && lastValidBlockHeight !== undefined && round % 4 === 0
      && (await blockhashExpired(connection, lastValidBlockHeight));
    if (timedOut || expired) {
      const left = openIdx();
      try {
        const { value } = await connection.getSignatureStatuses(left.map((i) => signatures[i]), {
          searchTransactionHistory: true,
        });
        value.forEach((st, k) => { result[left[k]] = Boolean(st && !st.err); });
      } catch { /* blijft null → false */ }
      break;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return result.map((r) => r === true);
}

/** Bevestig een transactie via HTTP-polling (geen WebSocket). */
export async function pollConfirm(
  connection: Connection,
  signature: string,
  { tries = 60, intervalMs = 1500, lastValidBlockHeight }: { tries?: number; intervalMs?: number; lastValidBlockHeight?: number } = {}
): Promise<boolean> {
  // Met lastValidBlockHeight: wachten tot het definitief is. Zonder (bv. een tx die de
  // wallet zelf verstuurde): na tries × interval nog één history-check, zodat een tx die
  // net te laat landde niet als mislukt telt.
  return (await pollConfirmMany(connection, [signature], lastValidBlockHeight, {
    intervalMs,
    maxMs: tries * intervalMs,
  }))[0];
}
