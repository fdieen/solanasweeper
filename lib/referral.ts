import { PublicKey, type Connection } from '@solana/web3.js';

/**
 * Referral-attributie (client-side).
 * - Leest ?ref= van de URL, valideert als base58 Solana-adres, bewaart in localStorage
 *   met timestamp. 30 dagen geldig, last-click wins.
 * - Negeert een referrer die gelijk is aan de (later) verbonden wallet (geen self-referral).
 * De on-chain fee-split gebruikt deze waarde; Supabase-tracking is optioneel en apart.
 */

const KEY = 'ss_ref';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

export function isValidSolAddress(s: string): boolean {
  try {
    // PublicKey gooit bij ongeldige base58/lengte; on-curve niet vereist voor een wallet.
    new PublicKey(s.trim());
    return true;
  } catch {
    return false;
  }
}

type Stored = { ref: string; ts: number };

/** Lees ?ref= uit de huidige URL en sla op (last-click wins). Alleen client. */
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = new URLSearchParams(window.location.search).get('ref');
    if (!raw) return;
    const ref = raw.trim();
    if (!isValidSolAddress(ref)) return;
    const payload: Stored = { ref: new PublicKey(ref).toBase58(), ts: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* localStorage geblokkeerd / URL onparseerbaar → stil negeren */
  }
}

/** De opgeslagen referrer als die nog geldig is (binnen 30 dagen), anders null. */
export function getStoredReferrer(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const { ref, ts } = JSON.parse(raw) as Stored;
    if (!ref || typeof ts !== 'number') return null;
    if (Date.now() - ts > MAX_AGE_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    if (!isValidSolAddress(ref)) return null;
    return ref;
  } catch {
    return null;
  }
}

/**
 * De effectieve referrer voor een verbonden wallet: de opgeslagen referrer, tenzij die
 * gelijk is aan de wallet zelf (dan null — geen self-referral).
 */
export function getReferrerForWallet(connectedWallet: string | null | undefined): string | null {
  const ref = getStoredReferrer();
  if (!ref) return null;
  if (connectedWallet && ref === connectedWallet) return null;
  return ref;
}

/**
 * De definitieve referrer voor een sweep, klaar om in de tx te splitsen:
 * 1) een reeds vastgelegde binding (overrulet localStorage), anders de localStorage-referrer;
 * 2) niet de wallet zelf;
 * 3) het account moet on-chain bestaan (getAccountInfo != null).
 * Retourneert null als er geen geldige referrer is → dan 100% naar de fee-wallet.
 */
export async function resolveReferrer(conn: Connection, owner: PublicKey): Promise<PublicKey | null> {
  const ownerStr = owner.toBase58();

  let candidate: string | null = null;
  try {
    const res = await fetch(`/api/referral/binding?wallet=${ownerStr}`, { cache: 'no-store' });
    if (res.ok) candidate = ((await res.json()) as { referrer?: string | null })?.referrer ?? null;
  } catch {
    /* server/route niet bereikbaar → val terug op localStorage */
  }
  if (!candidate) candidate = getReferrerForWallet(ownerStr);
  if (!candidate || candidate === ownerStr || !isValidSolAddress(candidate)) return null;

  const refPk = new PublicKey(candidate);
  try {
    const info = await conn.getAccountInfo(refPk);
    if (!info) return null; // referrer-account bestaat niet on-chain
  } catch {
    return null;
  }
  return refPk;
}

/**
 * Fire-and-forget: meld een bevestigde sweep-tx bij de record-route. We sturen ALLEEN de
 * signature — de server verifieert de tx on-chain en leidt referred/referrer/bedragen daaruit
 * af. Breekt de sweep-flow nooit.
 */
export function recordReferralPayout(txSignature: string): void {
  if (!txSignature) return;
  try {
    void fetch('/api/referral/record', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ txSignature }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* negeren */
  }
}
