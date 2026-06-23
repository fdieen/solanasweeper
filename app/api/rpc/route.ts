import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * Beveiligde Solana RPC-proxy.
 * - De Helius-key staat server-side in HELIUS_RPC_URL (nooit in de browser-bundle).
 * - Methode-allowlist: alleen wat de app nodig heeft.
 * - Rate-limit per IP (fail-open; nu in-memory, later Upstash).
 * - Origin-check als extra laag (spoofbaar, dus niet als enige bescherming).
 */

// JSON-RPC methodes die de app echt gebruikt
const ALLOWED_METHODS = new Set<string>([
  'getLatestBlockhash',
  'getSignatureStatuses',
  'sendTransaction',
  'simulateTransaction',
  'getTokenAccountsByOwner',
  'getAccountInfo',
  'getMultipleAccounts',
  'getBalance',
  'getMinimumBalanceForRentExemption',
  'getSlot',
  'getBlockHeight',
  'getEpochInfo',
  'getVersion',
  'getGenesisHash',
  // Helius DAS — alleen wat Pro Mode nodig heeft (inventaris + metadata)
  'getAssetsByOwner',
  'getAsset',
]);

function allowedOrigins(): string[] {
  return [
    process.env.NEXT_PUBLIC_SITE_URL,
    'https://solanasweeper.com',
    'https://www.solanasweeper.com',
    'http://localhost:3000',
    'http://localhost:3999',
  ].filter(Boolean) as string[];
}

/* ── Rate-limit (fail-open) ──
 * In-memory sliding window als baseline. Werkt niet over meerdere serverless
 * instances heen — vervang later door Upstash (Redis) met dezelfde signatuur.
 * Bij élke fout: true teruggeven (fail-open) zodat een storing de app niet breekt.
 */
const WINDOW_MS = 10_000;
const MAX_REQ_PER_WINDOW = 120;
const ipHits = new Map<string, number[]>();

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    // TODO: vervang door Upstash Ratelimit.limit(ip) — fail-open behouden.
    const now = Date.now();
    const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    ipHits.set(ip, recent);
    return recent.length <= MAX_REQ_PER_WINDOW;
  } catch {
    return true; // fail-open
  }
}

function getIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function jsonRpcError(message: string, status: number, id: unknown = null) {
  return new Response(
    JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32600, message } }),
    { status, headers: { 'content-type': 'application/json' } }
  );
}

export async function POST(req: NextRequest) {
  const upstream = process.env.HELIUS_RPC_URL;
  if (!upstream) {
    return jsonRpcError('RPC not configured (HELIUS_RPC_URL missing)', 500);
  }

  // Origin-check (extra laag)
  const origin = req.headers.get('origin');
  if (origin && !allowedOrigins().includes(origin)) {
    return jsonRpcError('Origin not allowed', 403);
  }

  // Rate-limit
  const ok = await checkRateLimit(getIp(req));
  if (!ok) {
    return jsonRpcError('Rate limit exceeded', 429);
  }

  // Body lezen
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError('Invalid JSON body', 400);
  }

  // Methode-allowlist (ondersteunt single + batch)
  const calls = Array.isArray(body) ? body : [body];
  for (const call of calls) {
    const method = (call as { method?: string })?.method;
    if (!method || !ALLOWED_METHODS.has(method)) {
      return jsonRpcError(`Method not allowed: ${method ?? 'unknown'}`, 403);
    }
  }

  // Doorsturen naar Helius
  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return jsonRpcError('Upstream RPC request failed', 502);
  }
}
