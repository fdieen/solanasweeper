---
title: "Agave 4.2 Rent Reduction: What It Actually Means for the SOL Locked in Your Token Accounts"
description: "Solana is cutting rent by up to 10x. Your existing token accounts are not affected — here's the math, the activation schedule, and what actually changes."
slug: agave-4-2-rent-reduction-reclaimable-sol
date: 2026-07-31
---

# Agave 4.2 Rent Reduction: What It Actually Means for the SOL Locked in Your Token Accounts

Solana is in the middle of a staged reduction of `lamports_per_byte`, the constant that determines how much SOL you have to lock up to open an on-chain account. The headline number moving around the ecosystem is a 90% cut. The number is real. The way most people are reading it is not.

The short version: **the SOL currently sitting in your existing token accounts is unaffected.** If you have a wallet full of empty accounts from tokens you traded years ago, that rent is still worth what it has always been worth. What changes is the price of opening *new* accounts from here on.

This page explains the mechanism, the schedule, and the actual math.

## What rent is

Rent on Solana is not a recurring fee. It is a refundable deposit. When an account is created, it has to hold a minimum lamport balance to be rent-exempt — this is the network's way of pricing permanent state storage. Close the account, and every lamport in it comes back to you.

The minimum is calculated as:

```
effective_size = ACCOUNT_STORAGE_OVERHEAD + data_size_bytes
min_balance    = effective_size × lamports_per_byte
```

For a standard SPL token account (an "ATA"): 165 bytes of data plus 128 bytes of storage overhead = 293 bytes. At the current `lamports_per_byte` of 6,960, that is **2,039,280 lamports — 0.00203928 SOL** locked per account.

Every token you have ever received, airdropped or traded created one of these. Most people have dozens. Some have hundreds.

## What is actually changing

SIMD-0437 reduces `lamports_per_byte` from 6,960 down to 696 — a 10x reduction — but it does so **in five separate feature-gated steps**, not in one activation:

| Step | `lamports_per_byte` | ATA rent | Reduction from today |
|---|---|---|---|
| Today | 6,960 | 0.00203928 SOL | — |
| 1 | 6,333 | 0.00185557 SOL | 9% |
| 2 | 5,080 | 0.00148844 SOL | 27% |
| 3 | 2,575 | 0.00075448 SOL | 63% |
| 4 | 1,322 | 0.00038735 SOL | 81% |
| 5 | 696 | 0.00020393 SOL | 90% |

Anza's Agave v4.2 schedule targets the **first** of these steps for mainnet activation in August 2026, alongside 200ms slot times and larger transaction sizes. Each subsequent step is gated behind its own activation and requires an explicit risk assessment — the concern being that cheaper state means faster state growth, which is the thing validators have to carry.

There is no published date for steps two through five. Treat the full 10x as a multi-stage process measured in quarters, not weeks.

## Why your existing accounts are not repriced

This is the part that gets lost.

`lamports_per_byte` sets the *minimum balance required* for an account to be rent-exempt. It does not reach into accounts that already exist and remove lamports from them. An SPL token account does not store a "rent reserve" field that gets recalculated — it simply has a lamport balance, and that balance was funded at creation time under the old constant.

When you close a token account, the SPL Token program's `CloseAccount` instruction transfers **the entire lamport balance** of that account to a destination you specify. Not the current minimum. Not the new minimum. All of it.

So an ATA created in 2023, 2025 or last Tuesday holds 2,039,280 lamports, and closing it returns 2,039,280 lamports — before, during and after every step of the reduction schedule.

What the reduction changes is the cost of the *next* account you open. After full activation, a new ATA locks roughly 0.0002 SOL instead of 0.002 SOL. Cheap enough that applications can plausibly cover it on behalf of their users, which is the entire point of the change.

## The practical consequence

Two things follow from this, and they point in opposite directions.

**Nothing is expiring.** There is no deadline, no cliff, and no urgency created by this upgrade for anyone holding old accounts. Anyone telling you to reclaim your rent *before the reduction hits* has the mechanism backwards. Your SOL is not going anywhere.

**But the pool stops growing.** Once the schedule completes, newly created accounts lock 10x less. The large-deposit accounts sitting in wallets across Solana are a legacy stock — finite, created under the old pricing, and not being replenished at the same value. The aggregate amount of SOL recoverable from account closures gets smaller over time, not because existing accounts lose value, but because the accounts created after activation are worth a tenth as much when closed.

If you have never swept your wallet, the amount you can recover today is as high as it will ever be. Not because of a deadline — because of arithmetic.

## Check what you're holding

You can see exactly how many empty token accounts are sitting in your wallet, and how much SOL they have locked, without connecting anything. [SolanaSweeper's checker](https://solanasweeper.com) reads public on-chain state from a wallet address alone — paste it in, get the number.

If you decide to reclaim it, closing is non-custodial and happens in a transaction you sign yourself. Your tokens are never transferred, only empty accounts are closed, and the rent goes directly back to your wallet.

## References

- [SIMD-0437: Incremental Reduction of `lamports_per_byte` to 696](https://github.com/solana-foundation/solana-improvement-documents/pull/437)
- [SIMD-0436: Reduce Rent-Exempt Minimum by 2x](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0436-reduce-rent-exempt-minimum-by-2x.md)
- [Solana Network Upgrades](https://solana.com/news/solana-network-upgrades)
- [Anza: Rent documentation](https://docs.anza.xyz/implemented-proposals/rent)
