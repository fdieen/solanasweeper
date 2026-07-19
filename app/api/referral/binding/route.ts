import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function isValid(a: string): boolean {
  try { new PublicKey(a); return true; } catch { return false; }
}

/**
 * GET /api/referral/binding?wallet=<base58>
 * Retourneert de reeds vastgelegde referrer voor een wallet (of null). De client gebruikt
 * dit om de binding te laten overrulen boven localStorage. Faalt nooit hard: null bij
 * ongeldig adres of ongeconfigureerde Supabase.
 */
export async function GET(req: Request) {
  const wallet = (new URL(req.url).searchParams.get('wallet') ?? '').trim();
  if (!isValid(wallet)) return NextResponse.json({ referrer: null });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ referrer: null });

  const { data } = await db
    .from('referral_bindings')
    .select('referrer_wallet')
    .eq('referred_wallet', new PublicKey(wallet).toBase58())
    .maybeSingle();

  return NextResponse.json({ referrer: data?.referrer_wallet ?? null });
}
