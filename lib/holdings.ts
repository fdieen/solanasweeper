import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from './funMode';
import { valuateMint } from './jupiter';
import type { TokenHolding, Valuation } from './classify';

/** Metadata per mint uit Helius DAS. */
type DasMeta = { name?: string; image?: string; isNft: boolean; compressed: boolean };

function rpcOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/** Helius DAS getAssetsByOwner via onze /api/rpc proxy → metadata-map per mint. */
async function getDasMetadata(owner: string): Promise<Map<string, DasMeta>> {
  const map = new Map<string, DasMeta>();
  try {
    const res = await fetch(`${rpcOrigin()}/api/rpc`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'das',
        method: 'getAssetsByOwner',
        params: { ownerAddress: owner, page: 1, limit: 1000, displayOptions: { showFungible: true } },
      }),
    });
    if (!res.ok) return map;
    const json = await res.json();
    const items: unknown[] = json?.result?.items ?? [];
    for (const it of items as Array<Record<string, unknown>>) {
      const id = it.id as string | undefined;
      if (!id) continue;
      const iface = (it.interface as string) ?? '';
      const content = it.content as { metadata?: { name?: string }; links?: { image?: string } } | undefined;
      const compression = it.compression as { compressed?: boolean } | undefined;
      map.set(id, {
        name: content?.metadata?.name,
        image: content?.links?.image,
        isNft: /NFT/i.test(iface), // V1_NFT, ProgrammableNFT, etc.
        compressed: Boolean(compression?.compressed),
      });
    }
  } catch {
    // DAS niet beschikbaar → lege map (UI valt terug op mint-afkorting)
  }
  return map;
}

/** Alle token-accounts (SPL + Token-2022) als ruwe holdings. */
async function getTokenAccounts(connection: Connection, owner: PublicKey): Promise<TokenHolding[]> {
  const out: TokenHolding[] = [];
  const programs = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];
  for (const programId of programs) {
    let value: Awaited<ReturnType<Connection['getParsedTokenAccountsByOwner']>>['value'] = [];
    try {
      const res = await connection.getParsedTokenAccountsByOwner(owner, { programId });
      value = res.value;
    } catch {
      continue; // bv. Token-2022 niet beschikbaar
    }
    for (const acc of value) {
      const data = acc.account.data as {
        parsed?: { info?: { tokenAmount?: { amount?: string; decimals?: number }; state?: string; mint?: string } };
      };
      const info = data?.parsed?.info;
      if (!info?.mint || info.tokenAmount?.amount === undefined) continue;
      const decimals = info.tokenAmount.decimals ?? 0;
      const amountRaw = info.tokenAmount.amount;
      out.push({
        tokenAccount: acc.pubkey,
        mint: new PublicKey(info.mint),
        programId,
        amountRaw,
        decimals,
        lamports: acc.account.lamports,
        frozen: info.state === 'frozen',
        // voorlopige NFT-heuristiek; DAS overschrijft hieronder indien bekend
        isNft: decimals === 0 && amountRaw === '1',
        compressed: false,
      });
    }
  }
  return out;
}

/** Volledige inventaris met metadata (token-accounts + DAS samengevoegd). */
export async function scanHoldings(connection: Connection, owner: PublicKey): Promise<TokenHolding[]> {
  const [accounts, meta] = await Promise.all([
    getTokenAccounts(connection, owner),
    getDasMetadata(owner.toBase58()),
  ]);
  for (const h of accounts) {
    const m = meta.get(h.mint.toBase58());
    if (m) {
      h.name = m.name;
      h.image = m.image;
      if (m.isNft) h.isNft = true;
      h.compressed = m.compressed;
    }
  }
  return accounts;
}

/**
 * Valuatie per mint (route + prijs). Alleen non-empty fungibles worden bevraagd
 * (empty → Fun Mode, NFT → nft-bucket — die hoeven geen quote).
 */
export async function valuateAll(holdings: TokenHolding[]): Promise<Map<string, Valuation>> {
  const map = new Map<string, Valuation>();
  const targets = holdings.filter((h) => h.amountRaw !== '0' && !h.isNft);
  // unieke mints
  const seen = new Set<string>();
  const unique = targets.filter((h) => {
    const k = h.mint.toBase58();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  await Promise.all(
    unique.map(async (h) => {
      const v = await valuateMint(h.mint.toBase58(), h.amountRaw);
      map.set(h.mint.toBase58(), v);
    })
  );
  return map;
}
