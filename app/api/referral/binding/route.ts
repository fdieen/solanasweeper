import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function isValid(a: string): boolean {
  try { new PublicKey(a); return true; } catch { return false; }
}

/**
 * GET /api/referral/binding?wallet=<base58>
 * Retourneert de vastgelegde referrer voor een wallet (of null), plus wanneer die binding
 * ontstond. Een binding geldt 60 dagen (migratie 0003): verlopen bindingen worden hier
 * weggefilterd, zodat een volgende ?ref=-klik weer telt.
 *
 * boundAt gaat mee zodat de client een VERSERE ?ref=-klik kan laten winnen van de
 * bestaande binding — anders zou een nieuwe link nooit iets veranderen zolang de oude
 * binding leeft. Faalt nooit hard: null bij ongeldig adres of ongeconfigureerde Supabase.
 */
export async function GET(req: Request) {
  const wallet = (new URL(req.url).searchParams.get('wallet') ?? '').trim();
  if (!isValid(wallet)) return NextResponse.json({ referrer: null, boundAt: null });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ referrer: null, boundAt: null });

  const { data } = await db
    .from('referral_bindings')
    .select('referrer_wallet, created_at, expires_at')
    .eq('referred_wallet', new PublicKey(wallet).toBase58())
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return NextResponse.json({
    referrer: data?.referrer_wallet ?? null,
    // Moment van binden: bij een her-binding zet de record-route created_at opnieuw.
    boundAt: data?.created_at ?? null,
  });
}
