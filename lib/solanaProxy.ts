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

/** Bevestig een transactie via HTTP-polling (geen WebSocket). */
export async function pollConfirm(
  connection: Connection,
  signature: string,
  { tries = 30, intervalMs = 1500 }: { tries?: number; intervalMs?: number } = {}
): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      const { value } = await connection.getSignatureStatuses([signature]);
      const st = value[0];
      if (st) {
        if (st.err) return false;
        if (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized') {
          return true;
        }
      }
    } catch {
      // tijdelijke fout → blijven pollen
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
