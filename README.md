# SolanaSweeper

Non-custodial Solana wallet cleanup. SolanaSweeper closes empty SPL token
accounts and reclaims the ~0.002 SOL of rent locked in each, swaps leftover
dust to SOL, and burns worthless tokens and junk NFTs — **every action is
signed by the user; nothing is ever held by us.**

Live: https://solanasweeper.com

> This README is written for people **reviewing the code for safety**. It
> focuses on the trust boundaries: what gets signed by whom, what runs
> server-side, and where funds move.

## What it does

- **Fun Mode** — scan a connected wallet for empty token accounts and close
  them, reclaiming the locked rent. Nothing is destroyed; a closed account can
  be recreated later.
- **Pro Mode** — swap residual token balances to SOL (via Jupiter) and
  permanently burn worthless SPL tokens and junk NFTs. Every irreversible
  action requires explicit confirmation before the user signs.
- **Read-only preview** — paste any Solana address to see how much SOL is
  reclaimable, with no wallet connection at all.

## Non-custodial by design

- The app never sees or stores private keys or seed phrases. Every transaction
  is built client-side and **signed by the user's own wallet** (Phantom,
  Solflare, Backpack, via Reown AppKit).
- No server holds funds or signs on behalf of a user. Server routes only
  (a) proxy RPC and (b) record referral tracking — neither can move funds.
- The fee is an **instruction inside the same user-signed transaction**, not a
  separate transfer the app initiates on its own.

## Fees — how much, and where it goes

- The platform fee is **10%** of the SOL reclaimed in a sweep (`FEE_BPS = 1000`
  basis points); the user keeps **90%**. See `lib/funMode.ts`.
- The fee is paid to a **public fee-wallet address**, configured via
  `NEXT_PUBLIC_FEE_WALLET`. That is a receiving address — visible on-chain,
  not a secret.
- A gas floor (`MIN_SOL_FOR_GAS = 0.005 SOL`) prevents building a sweep a
  wallet can't afford to submit.
- **Referrals:** a sweep that arrives through a referral link splits the 10%
  fee **75% fee-wallet / 25% referrer**, on-chain, in the same transaction.
  The on-chain split works with or without the tracking backend; a sweep never
  breaks if tracking is down. Referral bindings are verified against the actual
  confirmed on-chain transaction server-side and **cannot be forged** — see
  `app/api/referral/record/route.ts` and `REFERRAL.md`.

## Trust boundaries (what to review)

- **Client vs. server secrets.** The RPC endpoint (Helius) and the Supabase
  `service_role` key live **only** in server env and are used **only** in
  server routes (`app/api/rpc`, `app/api/referral/*`, `lib/supabaseAdmin.ts`).
  They never ship to the browser and are never committed. Anything with the
  `NEXT_PUBLIC_` prefix is intentionally public (it ships in the JS bundle).
- **RPC proxy.** Client calls go through `/api/rpc`, which holds the keyed
  Helius URL server-side and enforces a CORS allowlist — the key is never
  exposed to the client.
- **Referral database.** Supabase is used only for referral bindings, a payout
  log, and stats. Row Level Security is **enabled** on both tables with **no
  policies**, so the `anon`/`public` roles get **zero** access; all reads and
  writes go through server routes using the service_role key. Rows are only
  ever created from a verified, confirmed on-chain transaction.
- **No secrets in the repo.** Only `.env.example` (placeholders) is committed;
  real keys live in `.env.local` and the hosting provider's env.

## Tech stack

Next.js (App Router) · TypeScript · Reown AppKit + Solana wallet adapters ·
`@solana/web3.js` · Jupiter (swaps) · Supabase (referral tracking only) ·
deployed on Vercel.

## Run it locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # fill in the values you need
npm run dev                  # http://localhost:3000
```

Environment variables (see `.env.example` for the annotated full list):

| Variable | Scope | Secret? | Needed for |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | client | no | CORS allowlist of `/api/rpc` |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | client | no | wallet connection (Reown) |
| `NEXT_PUBLIC_FEE_WALLET` | client | no (public address) | fee destination |
| `NEXT_PUBLIC_JUP_FEE_ACCOUNT` | client | no | Jupiter swap-fee account (optional) |
| `HELIUS_RPC_URL` | **server** | **yes** | RPC, proxied via `/api/rpc` |
| `NEXT_PUBLIC_SUPABASE_URL` | client | no | referral tracking (optional) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server** | **yes** | referral tracking (optional) |

The UI runs without the referral variables: leave the Supabase vars unset and
referral tracking becomes a no-op. **Never give a secret the `NEXT_PUBLIC_`
prefix** — that would ship it to the browser.

## Security disclosure

Found a vulnerability? Please report it privately — DM **@solanasweeper_** on
X — rather than opening a public issue.

## License

[MIT](./LICENSE). The license covers the code; it does not grant any rights to
the "SolanaSweeper" name or logo.
