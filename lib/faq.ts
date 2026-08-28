/**
 * FAQ-registry — één bron van waarheid voor /faq: de zichtbare accordion én de
 * FAQPage-JSON-LD lezen dezelfde array, zodat de structured data woordelijk matcht
 * met wat op de pagina staat (Google-vereiste). Bron: solanasweeper-faq-copy.md.
 * Bewust zonder zware imports, zodat een client component dit kan gebruiken zonder
 * extra bundle-gewicht (net als lib/pricing).
 */
import { FEE_PERCENT } from '@/lib/pricing';

export type Faq = { q: string; a: string; link?: { text: string; href: string } };

export const FAQS: Faq[] = [
  {
    q: 'How do I get my SOL back from empty token accounts?',
    a: `You get it back by closing the account. Every empty SPL token account still holds a rent deposit of about 0.00204 SOL, and closing it returns that deposit to your wallet in the same transaction. Every token you have ever held opened its own account, and each one locked that deposit when it was created. Selling or transferring the token does not return it — the empty account keeps it until you close it. SolanaSweeper scans your address, finds every empty account, and batches the closes so you sign once instead of a hundred times.`,
    link: { text: 'See how it works', href: '/how-it-works' },
  },
  {
    q: 'Is it safe to close Solana token accounts?',
    a: `Yes. Closing an empty token account is a standard Solana instruction that cannot touch tokens you still hold, because the network refuses to close any account with a non-zero balance. The protocol itself enforces this: if an account still holds a token, the close instruction fails. That means the accounts SolanaSweeper closes are, by definition, ones holding nothing. The transaction you sign contains closeAccount instructions and nothing else — no approve, no setAuthority, no transfers.`,
  },
  {
    q: 'How much SOL can I recover from empty accounts?',
    a: `About 0.00204 SOL per empty account, so a wallet with 100 dead accounts is holding roughly 0.2 SOL. The exact figure depends on the account's data size, and Token-2022 accounts with extensions can hold slightly more. Active traders, airdrop farmers and anyone who lived through a memecoin season typically carry dozens to hundreds of these. You can check any address on SolanaSweeper without connecting a wallet, so you can see the number before deciding anything.`,
    link: { text: 'Scan an address', href: '/' },
  },
  {
    q: 'Will closing a token account delete my tokens?',
    a: `No. Solana will not close an account that still holds a balance, so tokens you own cannot be removed by closing accounts. This is enforced at protocol level, not by our code. Clearing out worthless dust or spam tokens is a separate, deliberate action — that is burning, and SolanaSweeper keeps it behind Pro Mode so it can never happen by accident.`,
  },
  {
    q: 'What is rent-exempt SOL on Solana?',
    a: `Rent is a one-time deposit Solana charges for the storage an account occupies on-chain, about 0.00204 SOL for a standard token account. Instead of billing you monthly, the network asks for a deposit that makes the account exempt from being reclaimed. The deposit stays yours the whole time. It is not a fee and not an airdrop — it is your own SOL, parked. Close the account and it comes back.`,
    link: { text: 'Read the guide', href: '/guide/what-is-rent-on-solana' },
  },
  {
    q: 'Does SolanaSweeper need my seed phrase?',
    a: `No. SolanaSweeper never asks for your seed phrase, never holds your keys, and cannot move funds. Every transaction is signed in your own wallet. The wallet signature is the security boundary: we build a transaction, your wallet shows you exactly what it contains, and nothing happens until you approve it. Any site asking for a seed phrase to "reclaim" SOL is a drainer, without exception.`,
  },
  {
    q: 'What fee does SolanaSweeper charge?',
    a: `SolanaSweeper takes ${FEE_PERCENT}% of the SOL you reclaim, deducted from the returned amount — you keep ${100 - FEE_PERCENT}%, and never pay out of pocket. On a typical empty account holding 0.00204 SOL, you keep about 0.00184 SOL and we take 0.0002 SOL. The fee is a plain SystemProgram.transfer inside the same transaction you sign, so you can see the exact amount and destination in your wallet before approving anything. No subscription, no minimum, and no charge if nothing is reclaimed.`,
  },
  {
    q: 'Which wallets work with SolanaSweeper?',
    a: `SolanaSweeper works with Phantom and Solflare as featured options, plus any Solana wallet supporting the Wallet Standard or WalletConnect, including Backpack. Installed wallets are detected automatically and appear in the connect modal without setup. Mobile wallets connect by QR through WalletConnect. There is no email login, no social login and no account — you connect directly with your wallet and nothing else. Hardware wallet users should expect to approve several batched transactions rather than one, since large numbers of accounts are split across transactions to stay within Solana's size limits.`,
    link: { text: 'See how it works', href: '/how-it-works' },
  },
  {
    q: 'Can I close Token-2022 accounts?',
    a: `Yes. SolanaSweeper handles both classic SPL and Token-2022 accounts, including most extension types. This matters more than it sounds: many cleanup tools only handle classic SPL, which means a chunk of reclaimable rent in active wallets simply never gets found. Some Token-2022 extensions block closing until a withheld transfer fee is harvested to the mint. We detect these and tell you rather than failing silently.`,
  },
  {
    q: 'What happens if I receive that token again later?',
    a: `Nothing breaks. If someone sends you that token again, a fresh account is created automatically at that moment. Closing an account is not permanent in any way that costs you. The new account will lock a new rent deposit, which you can reclaim again later. There is no reason to keep an empty account open just in case.`,
    link: { text: 'See how it works', href: '/how-it-works' },
  },
  {
    q: 'Does SolanaSweeper have its own smart contract?',
    a: `No. SolanaSweeper has no on-chain program of its own — every instruction it builds belongs to Solana's own programs. That means there is no custom contract to audit, no upgrade authority anyone could flip, and no deployed bytecode that could drift from published source. Closing accounts uses the SPL Token and Token-2022 programs, the fee is a plain System Program transfer, priority fees use the Compute Budget program, and swaps in Pro Mode are transactions built by Jupiter. Our source is public at https://github.com/fdieen/solanasweeper, and the transaction itself is the proof: your wallet shows you every instruction before you sign.`,
  },
  {
    q: 'How is SolanaSweeper different from other Solana cleaners?',
    a: `SolanaSweeper runs no smart contract of its own, so there is nothing you have to trust beyond Solana's own programs and the transaction in front of you. You can also scan any address before connecting a wallet at all. Most comparisons of Solana cleanup tools are written by the tools themselves, and the fee figures contradict each other depending on who published them. The honest position is that on 0.00204 SOL per account, the difference between a 2% and a 20% fee is a few dollars across a full cleanup — what actually matters is whether you can verify what you are signing. For pure rent reclamation with no third party at all, spl-token close --gc in the Solana CLI is free and always will be. We are selling batching, safety checks and a UI, not capability.`,
  },
];
