/**
 * Foutmeldingen-registry (/errors)
 * --------------------------------
 * Eén bron van waarheid voor de /errors-sectie: overzichtspagina, sitemap,
 * TechArticle-JSON-LD en de onderlinge links. Nieuwe pagina = een entry hier
 * (in volgorde van hoe vaak de melding voorkomt) + een map onder app/errors/<slug>/.
 *
 * Waarom een eigen sectie en niet gewoon blogposts: iemand die een foutmelding
 * intypt, zoekt op de letterlijke tekst en wil één antwoord. Die pagina's moeten kort
 * zijn, dezelfde vorm hebben en naar elkaar kunnen verwijzen. Search Console laat zien
 * dat meer dan de helft van de niet-merkgebonden vertoningen uit dit soort zoekopdrachten
 * komt, terwijl er nauwelijks fatsoenlijke pagina's over bestaan.
 *
 * De foutcodes komen uit de TokenError-enum van spl-token-2022 (variant-index =
 * hexcode): 1 = InsufficientFunds, 11 = NonNativeHasBalance, 35 = AccountHasWithheldTransferFees.
 * Controleer een nieuwe code daar voordat je hem hier opschrijft, niet in een blogpost
 * van iemand anders.
 */

export const SITE_URL = 'https://solanasweeper.com';

export type ErrorPage = {
  slug: string;
  /** Hexcode zoals de wallet hem toont, of undefined als de melding er geen heeft. */
  code?: string;
  /** De letterlijke tekst die de gebruiker ziet — staat als <code> boven de pagina. */
  errorText: string;
  /** Pagina <title> (zonder site-suffix) */
  title: string;
  /** On-page h1 */
  h1: string;
  description: string;
  keywords: string[];
  /** Eén zin: het antwoord, nog voor de uitleg. Index-kaart + lead. */
  excerpt: string;
  datePublished: string;
  dateModified: string;
  readingTime: string;
};

export const ERROR_PAGES: ErrorPage[] = [
  {
    slug: 'transaction-simulation-failed',
    errorText: 'Transaction simulation failed',
    title: 'Solana: Transaction Simulation Failed — How to Read the Error',
    h1: 'Transaction simulation failed',
    description:
      'Simulation failed is not the error, it is the wrapper around one. How to find the actual program error code your wallet is hiding, and what the common ones mean.',
    keywords: [
      'transaction simulation failed solana', 'insufficient funds simulation failed',
      'simulation failed err 1', 'phantom simulation failed', 'solana simulation error',
      'custom program error solana',
    ],
    excerpt:
      'Your wallet rejected the transaction before it reached the chain, which is good news: nothing was spent. The useful part is the code hiding behind the message.',
    datePublished: '2026-09-20',
    dateModified: '2026-09-20',
    readingTime: '3 min read',
  },
  {
    slug: 'custom-program-error-0x1',
    code: '0x1',
    errorText: 'custom program error: 0x1',
    title: 'Solana Error 0x1: Insufficient Funds (and Why It Is Not Your SOL)',
    h1: 'custom program error: 0x1',
    description:
      'Error 0x1 is InsufficientFunds from the token program. It is about the token you are moving, not the SOL in your wallet, which is why topping up rarely fixes it.',
    keywords: [
      'custom program error 0x1', 'solana error 0x1', 'insufficient funds solana error 1',
      'err 1 solana', 'token program error 1', 'phantom insufficient funds',
    ],
    excerpt:
      'The token program reporting that the account does not hold as much as the instruction is trying to move. Adding SOL will not help, because SOL is not what ran out.',
    datePublished: '2026-09-20',
    dateModified: '2026-09-20',
    readingTime: '3 min read',
  },
  {
    slug: 'custom-program-error-0xb',
    code: '0xb',
    errorText: 'custom program error: 0xb',
    title: 'Solana Error 0xb: Account Can Only Be Closed If Its Balance Is Zero',
    h1: 'custom program error: 0xb',
    description:
      'Error 0xb is NonNativeHasBalance: you are closing a token account that still holds something. Usually dust you cannot see, and there are exactly two ways out.',
    keywords: [
      'custom program error 0xb', 'solana error 0xb', 'NonNativeHasBalance',
      'close token account balance not zero', 'cannot close token account solana',
      'token account dust close',
    ],
    excerpt:
      'The account you are closing is not empty. Almost always a fraction too small for your wallet to display, left behind by a partial fill or a rounding remainder.',
    datePublished: '2026-09-20',
    dateModified: '2026-09-20',
    readingTime: '3 min read',
  },
  {
    slug: 'custom-program-error-0x23',
    code: '0x23',
    errorText: 'custom program error: 0x23',
    title: 'Solana Error 0x23: Withheld Transfer Fees Block the Close',
    h1: 'custom program error: 0x23',
    description:
      'Error 0x23 is AccountHasWithheldTransferFees, a Token-2022 account holding fees that were withheld on transfer. Harvest them to the mint and the close goes through.',
    keywords: [
      'custom program error 0x23', 'solana error 0x23', 'AccountHasWithheldTransferFees',
      'token-2022 close account error', 'withheld transfer fees solana',
      'harvest withheld tokens to mint',
    ],
    excerpt:
      'A Token-2022 account reads as zero but is not closeable, because the transfer fee extension parked withheld fees inside it. One extra instruction clears it.',
    datePublished: '2026-09-20',
    dateModified: '2026-09-20',
    readingTime: '3 min read',
  },
];

export const getErrorPage = (slug: string): ErrorPage | undefined =>
  ERROR_PAGES.find((e) => e.slug === slug);
