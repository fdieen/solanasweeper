---
title: "Why every Solana token you ever held costs you 0.002 SOL"
description: "Each token you receive on Solana quietly locks 0.002 SOL in a token account — and it stays locked after you sell. Here's how the math adds up, how to see your number, and how to get it back."
slug: every-solana-token-costs-0002-sol
date: 2026-09-07
tags: [solana, rent, token-accounts, reclaim, wallet-hygiene]
---

# Why every Solana token you ever held costs you 0.002 SOL

Here is a number most Solana users never look at: **0.00203928 SOL**.

That is what your wallet pays, silently, the first time it receives any new token. Not to the sender, not to a DEX — to the network, as a deposit on a small piece of storage called a *token account*. You get it back only if you close the account. Almost nobody does.

## What a token account is

Your wallet address holds SOL directly. It cannot hold tokens directly. For every distinct token (BONK, USDC, that thing from the group chat), Solana creates a separate 165-byte account owned by your wallet that tracks the balance for that one token. That account must hold a rent-exempt minimum of 0.002 SOL for as long as it exists.

Sell the token, send it away, watch it go to zero — the account stays. Balance zero, deposit still locked.

## How it adds up

| Tokens ever held | SOL locked |
|---|---|
| 10 | 0.02 |
| 50 | 0.10 |
| 200 | 0.41 |
| 1,000 | 2.04 |

The numbers on the right are what a wallet is holding *hostage*, not what it is worth. Someone who airdrop-farmed for a season can easily be at the bottom of that table without ever noticing, because no wallet UI shows rent as a line item.

One real example from last weekend: a single wallet closed roughly 1,300 empty token accounts in one sitting and recovered about 2.6 SOL. The tokens were long gone; the deposits were not.

## How to see your number

You do not need to connect anything. Paste any wallet address into the checker on [solanasweeper.com](https://solanasweeper.com) and it lists the empty token accounts and the total SOL sitting in them. If you prefer the command line:

```
spl-token accounts --owner <YOUR_WALLET>
```

Every line with a zero balance is 0.002 SOL waiting.

## How to get it back

Closing a token account is a standard instruction in the SPL Token program (`CloseAccount`). It requires:

- the account balance to be exactly zero, and
- your signature as the owner.

The rent goes back to your wallet in the same transaction. Nothing is burned, nothing is transferred to anyone else, and the account can be recreated later for free if you ever receive that token again.

Two things to know before you do it in bulk:

**Token-2022 accounts may need one extra step.** Tokens with a transfer fee keep a small *withheld* amount inside the account even at zero balance. Those accounts fail to close with `custom program error: 0x23` until the withheld fee is harvested to the mint first. A good sweeper adds that instruction automatically.

**Dust is not empty.** An account with a few raw units of a token is not closable. Selling manually usually fails because the amount is below the DEX minimum. Fun Mode on SolanaSweeper only touches truly empty accounts; Pro Mode swaps the dust into SOL first (via Jupiter), and the account is closed on the next sweep once it is empty — so you get the dust value *and* the rent back.

## Why this matters more than it looks

0.002 SOL is small. But it compounds with the one behaviour Solana rewards most — trying lots of things. Every airdrop claimed, every meme coin tested, every NFT collection minted leaves a deposit behind. The more active you are, the more of your own SOL you have parked in accounts that do nothing.

It is the closest thing Solana has to a free lunch: money that is already yours, sitting one signature away.
