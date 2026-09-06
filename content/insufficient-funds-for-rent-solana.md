---
title: "Insufficient funds for rent on Solana: what it means and how to fix it"
description: "Seeing 'insufficient funds for rent' or 'InsufficientFundsForRent' in Phantom, Solflare or Jupiter? Here's what Solana rent is, why the error appears even when you have SOL, and three ways to fix it in under a minute."
slug: insufficient-funds-for-rent-solana
date: 2026-09-07
tags: [solana, rent, errors, phantom, token-accounts]
---

# Insufficient funds for rent on Solana: what it means and how to fix it

You try to send a token, swap on Jupiter, or mint something, and your wallet throws one of these:

- `Insufficient funds for rent`
- `Transaction results in an account with insufficient funds for rent`
- `InsufficientFundsForRent { account_index: 0 }`
- `Transfer: insufficient lamports 4569890, need 4600000`

You *do* have SOL in the wallet. So what is Solana asking for?

## Rent in one paragraph

Every account on Solana — including every token account your wallet creates — has to hold a minimum SOL balance to stay alive. That minimum is called **rent**. It is not a recurring fee; it is a deposit. For a standard token account (165 bytes) the deposit is **0.00203928 SOL**. For your main wallet account it is about **0.00089 SOL**.

If a transaction would push any account *below* its rent minimum, the Solana runtime rejects the whole transaction before it touches the chain. That is the error you are seeing.

## Why it happens even though you "have SOL"

Three common situations:

**1. Your wallet balance is just above zero.**
You have, say, 0.0007 SOL. The transaction fee is 0.000005 SOL, but after paying it your wallet would sit below its own 0.00089 SOL minimum. Rejected. This is the most frequent cause on mobile wallets after a few days of trading.

**2. The transaction creates a new token account.**
Receiving a token you have never held before creates a fresh token account, and that account needs its own 0.002 SOL deposit. If you have 0.0015 SOL, the swap fails even though the swap itself is tiny.

**3. A fee or transfer leaves a few lamports short.**
The `insufficient lamports 4569890, need 4600000` variant means a transfer asked for more than the account holds — often a fee calculated on a stale balance. Thirty thousand lamports (0.00003 SOL) is enough to trigger it.

## How to fix it

**Option A — top up.** Send 0.01 SOL to the wallet. Boring, but it solves all three cases immediately.

**Option B — close empty token accounts you already own.**
Every token you have ever held and later sold or sent away left an empty account behind, each still holding its 0.002 SOL deposit. Twenty old meme coins means about 0.04 SOL sitting locked in accounts that do nothing. Closing them returns that SOL to your wallet — and closing is a normal Solana instruction that any wallet can sign.

You can do this from the command line with `spl-token close`, or use a tool like [SolanaSweeper](https://solanasweeper.com) that scans your wallet, shows how much is locked, and closes the empty accounts in one signature. You can check any wallet address on the site without connecting to see the number first.

**Option C — lower the batch.**
If you are doing something in bulk (closing, burning, sending), do fewer accounts per transaction. Each close instruction adds a little compute, and the fee grows with it.

## A note on Token-2022 accounts

Some newer tokens use the Token-2022 program with a *transfer fee* extension. When you sell all of such a token, the account balance goes to zero but a small **withheld fee** stays inside the account. Trying to close it gives a different error — `custom program error: 0x23` — and the fix is to harvest the withheld amount to the mint first, then close. Good tools do this automatically; if yours does not, that is why the close fails.

## Quick checklist

- Wallet below ~0.001 SOL? Top up or reclaim rent from empty accounts.
- First time receiving a token? You need 0.002 SOL spare for the new account.
- Error mentions `0x23`? It is a Token-2022 fee account; harvest before closing.
- Error persists after a top-up? Refresh the page — the app may be simulating against an old balance.

Rent is one of the few Solana concepts that catches everyone once. After that it is just a deposit you can get back.
