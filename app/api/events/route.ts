import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

/**
 * POST /api/events — foutlogging voor sweeps (zie migratie 0004).
 *
 * De route is bewust dom en streng: hij accepteert ALLEEN de velden hieronder, valideert
 * elk veld tegen een enum/formaat, kapt vrije tekst af en negeert al het overige. Wat de
 * client ook meestuurt, er kan niets anders in de tabel belanden — geen IP, geen user
 * agent, geen extra kolommen. Logging mag nooit een sweep breken, dus alles wat misgaat
 * (geen Supabase, ongeldige body, DB-fout) levert een 2xx op zonder detail.
 */

const MODES = new Set(['fun', 'pro']);
const PHASES = new Set(['scan', 'preflight', 'sign', 'send', 'confirm']);
const OUTCOMES = new Set(['ok', 'skipped', 'error']);

const MAX_MESSAGE = 300;   // onze eigen humanize-teksten zijn kort; kap de rest af
const MAX_ERROR_CODE = 64;

/* Rate-limit per IP (fail-open, in-memory) — zelfde vorm als in /api/rpc. Houdt een
 * kapotte client of een grapjas met curl uit de tabel; bij twijfel liever loggen dan
 * blokkeren, want dit pad mag nooit iets breken. */
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 60;
const ipHits = new Map<string, number[]>();

function withinRateLimit(ip: string): boolean {
  try {
    const now = Date.now();
    const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    ipHits.set(ip, recent);
    return recent.length <= MAX_EVENTS_PER_WINDOW;
  } catch {
    return true; // fail-open
  }
}

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** Base58-adres, genormaliseerd. Null bij alles wat geen geldig Solana-adres is. */
function cleanWallet(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  try {
    return new PublicKey(v.trim()).toBase58();
  } catch {
    return null;
  }
}

/** Korte vrije tekst: één regel, afgekapt. Null bij leeg. */
function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.replace(/\s+/g, ' ').trim().slice(0, max);
  return s.length > 0 ? s : null;
}

/** Transactiesignature: base58, 64–90 tekens. Null bij alles daarbuiten. */
function cleanSignature(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(s) ? s : null;
}

/** Niet-negatief geheel getal, of null. */
function cleanCount(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const n = Math.floor(v);
  return n >= 0 ? Math.min(n, 100_000) : null;
}

export async function POST(req: NextRequest) {
  if (!withinRateLimit(getIp(req))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const wallet = cleanWallet(body.wallet);
  const mode = typeof body.mode === 'string' ? body.mode : '';
  const phase = typeof body.phase === 'string' ? body.phase : '';
  const outcome = typeof body.outcome === 'string' ? body.outcome : '';

  // De vier verplichte velden moeten kloppen; anders slaan we niets op.
  if (!wallet || !MODES.has(mode) || !PHASES.has(phase) || !OUTCOMES.has(outcome)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, logged: false }); // niet geconfigureerd → no-op

  // Expliciete rij: alleen deze kolommen, niets uit de body doorgelust.
  const { error } = await db.from('sweep_events').insert({
    wallet,
    mode,
    phase,
    outcome,
    error_code: cleanText(body.errorCode, MAX_ERROR_CODE),
    message: cleanText(body.message, MAX_MESSAGE),
    signature: cleanSignature(body.signature),
    accounts_planned: cleanCount(body.accountsPlanned),
    accounts_done: cleanCount(body.accountsDone),
  });

  if (error) {
    // Nooit doorgeven aan de client: dit is logging, geen functionaliteit.
    console.error('[events] insert failed', error.message);
    return NextResponse.json({ ok: true, logged: false });
  }

  return NextResponse.json({ ok: true, logged: true });
}
