/**
 * Foutlogging voor sweeps (client-side helper bij POST /api/events).
 *
 * Fire-and-forget: geen await, geen throw, geen retry. Een logfout mag een sweep nooit
 * ophouden of laten falen — vandaar dat élke aanroep in een try/catch zit en de fetch een
 * eigen .catch() heeft. keepalive houdt het verzoek in leven als de gebruiker de tab sluit
 * vlak na een mislukte transactie, precies het geval dat je wél wil zien.
 *
 * Wat er gelogd wordt staat in migratie 0004: wallet-adres, fase, uitkomst, foutcode, een
 * korte melding uit onze eigen humanize-functies, de signature en twee tellingen. Geen
 * persoonsgegevens, geen tokennamen, geen mint-adressen — de server kapt bovendien alles
 * af wat hier per ongeluk te veel of te lang in zou komen.
 */

export type SweepMode = 'fun' | 'pro';
/** Waar in de flow zat de sweep: scannen, preflight, tekenen, versturen, bevestigen. */
export type SweepPhase = 'scan' | 'preflight' | 'sign' | 'send' | 'confirm';
export type SweepOutcome = 'ok' | 'skipped' | 'error';

export type SweepEvent = {
  wallet: string;
  mode: SweepMode;
  phase: SweepPhase;
  outcome: SweepOutcome;
  /** Korte, stabiele code voor filteren: 'insufficient_sol', 'simulation_failed', … */
  errorCode?: string;
  /** De tekst die de gebruiker te zien kreeg (al gehumaniseerd, nooit rauwe JSON). */
  message?: string;
  /** Alleen bij een verstuurde transactie. */
  signature?: string | null;
  accountsPlanned?: number;
  accountsDone?: number;
};

export function logSweepEvent(event: SweepEvent): void {
  try {
    if (!event?.wallet) return;
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* logging mag nooit de sweep breken */
  }
}

/**
 * Overgeslagen items samengevat per reden: één rij per reden met het aantal, in plaats van
 * één rij per account. Een wallet met honderd junk-accounts zou anders honderd vrijwel
 * identieke regels wegschrijven, terwijl de reden juist het interessante deel is.
 */
export function logSkipsByReason(
  base: { wallet: string; mode: SweepMode; phase: SweepPhase },
  reasons: string[],
): void {
  if (reasons.length === 0) return;
  const tally = new Map<string, number>();
  for (const r of reasons) tally.set(r, (tally.get(r) ?? 0) + 1);
  for (const [message, count] of tally) {
    logSweepEvent({ ...base, outcome: 'skipped', message, accountsPlanned: count });
  }
}
