import { VersionedTransaction } from '@solana/web3.js';
import type { Valuation } from './classify';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';

// 10% — Jupiter-docs noemen geen harde cap (uint16). LIVE bevestigen met een quote-test
// vóór we erop vertrouwen; anders verlagen we deze constante.
export const PLATFORM_FEE_BPS = 1000;

const QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';
const SWAP_URL = 'https://quote-api.jup.ag/v6/swap';
const PRICE_URL = 'https://api.jup.ag/price/v2';

export type Quote = { outAmount: string; [k: string]: unknown };

/** Haal een swap-quote (token → SOL). null = geen route. */
export async function getQuote(
  inputMint: string,
  amountRaw: string,
  slippageBps = 100
): Promise<Quote | null> {
  if (inputMint === SOL_MINT) return null;
  const url =
    `${QUOTE_URL}?inputMint=${inputMint}&outputMint=${SOL_MINT}` +
    `&amount=${amountRaw}&slippageBps=${slippageBps}&platformFeeBps=${PLATFORM_FEE_BPS}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const q = await res.json();
    if (!q || q.error || !q.outAmount || q.outAmount === '0') return null;
    return q as Quote;
  } catch {
    return null;
  }
}

/** Bekende prijs (USD) of null. */
export async function getPrice(mint: string): Promise<number | null> {
  try {
    const res = await fetch(`${PRICE_URL}?ids=${mint}`);
    if (!res.ok) return null;
    const j = await res.json();
    const p = j?.data?.[mint]?.price;
    return p ? Number(p) : null;
  } catch {
    return null;
  }
}

/** Waardebepaling van een mint: route + prijs. inTokenList optioneel (v2). */
export async function valuateMint(mint: string, amountRaw: string): Promise<Valuation> {
  const [quote, price] = await Promise.all([getQuote(mint, amountRaw), getPrice(mint)]);
  return {
    hasRoute: quote != null,
    hasPrice: price != null && price > 0,
    inTokenList: false,
    outLamports: quote ? Number(quote.outAmount) : undefined,
  };
}

/**
 * Bouw de swap-transactie uit een quote.
 * feeAccount = vooraf geïnitialiseerd wSOL fee-token-account (voor de 10% platform-fee).
 */
export async function buildSwapTransaction(
  quote: Quote,
  userPublicKey: string,
  feeAccount?: string
): Promise<VersionedTransaction> {
  const body: Record<string, unknown> = {
    quoteResponse: quote,
    userPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
  };
  if (feeAccount) body.feeAccount = feeAccount;

  const res = await fetch(SWAP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Jupiter swap build failed');
  const { swapTransaction } = await res.json();
  const buf = Uint8Array.from(atob(swapTransaction), (c) => c.charCodeAt(0));
  return VersionedTransaction.deserialize(buf);
}
