/**
 * Structured data — de enige plek waar JSON-LD wordt opgebouwd.
 * ------------------------------------------------------------
 * Eerder stond er schema in zes bestanden (root-layout, homepage, /faq, /guide,
 * /blog en beide artikel-templates), met een dubbele FAQPage en drie los van
 * elkaar gedefinieerde Organizations. Alles staat nu hier, één component per
 * paginatype, en alle entiteiten verwijzen naar hetzelfde Organization-@id in
 * plaats van hun eigen kopie mee te sturen.
 *
 * Regels die hier gelden:
 * - Organization staat op élke pagina (via SiteSchema in de root-layout).
 * - WebApplication staat alleen op de homepage.
 * - FAQPage staat alleen op /faq, gevoed uit lib/faq — dezelfde array die de
 *   pagina rendert, zodat schema en zichtbare tekst niet uit elkaar kunnen lopen.
 * - Artikelen krijgen author + publisher als @id-referentie naar Organization.
 */
import { FEE_PERCENT } from '@/lib/pricing';
import { FAQS } from '@/lib/faq';
import { GUIDE_ARTICLES, type GuideArticle } from '@/lib/guide';
import { BLOG_ARTICLES, type BlogArticle } from '@/lib/blog';

const SITE_URL = 'https://solanasweeper.com';

/** Eén Organization-node; alles verwijst hiernaar i.p.v. de eigenschappen te herhalen. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const ORG_REF = { '@id': ORGANIZATION_ID } as const;

const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * JSON.stringify ontsnapt geen '<'. Per de Next-docs (guides/json-ld) vervangen we
 * die door de unicode-escape, zodat een '<' in schema-tekst geen tag kan openen.
 */
function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** Home > … breadcrumb-trail; posities worden automatisch genummerd. */
function breadcrumb(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Organization + WebSite. Staat in de root-layout, dus op elke pagina. */
export function SiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': ORGANIZATION_ID,
            name: 'SolanaSweeper',
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
            email: 'solanasweeper.official@gmail.com',
            sameAs: [
              'https://x.com/solanasweeper_',
              'https://youtube.com/@SolanaSweeperOfficial',
              'https://www.tiktok.com/@solanasweeperofficial',
              'https://instagram.com/solanasweeperofficial',
              'https://t.me/solanasweeper',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'SolanaSweeper',
            description: `Non-custodial Solana wallet cleaner. Close empty token accounts and reclaim locked SOL rent. ${FEE_PERCENT}% fee, no smart contract of its own.`,
            publisher: ORG_REF,
            inLanguage: 'en',
          },
        ],
      }}
    />
  );
}

/** WebApplication — alleen op de homepage. */
export function HomeSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#webapp`,
        name: 'SolanaSweeper',
        url: SITE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires a Solana wallet supporting the Wallet Standard or WalletConnect',
        description: `SolanaSweeper is a non-custodial Solana dApp that closes empty SPL Token and Token-2022 accounts and returns the locked rent deposit (~0.00204 SOL per account) to your wallet. It has no smart contract of its own. It only builds instructions to Solana's SPL Token Program.`,
        publisher: ORG_REF,
        // price 0 = niets vooraf, geen abonnement. De werkelijke vergoeding is een
        // percentage van wat je terugkrijgt en kan dus geen vaste prijs zijn; die
        // staat daarom expliciet in feesAndCommissionsSpecification.
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: `Free to use: nothing up front, no subscription, and no charge if nothing is reclaimed.`,
          feesAndCommissionsSpecification: `SolanaSweeper charges a ${FEE_PERCENT}% platform fee on the rent reclaimed by a successful sweep, deducted from the SOL that is returned (you keep ${100 - FEE_PERCENT}%).`,
        },
      }}
    />
  );
}

/** FAQPage — alleen op /faq, uit dezelfde array die de pagina rendert. */
export function FaqSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/faq#faq`,
        url: `${SITE_URL}/faq`,
        publisher: ORG_REF,
        // De link-footer onder een antwoord is UI-navigatie, geen antwoordtekst.
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }}
    />
  );
}

/** Overzichtspagina /guide. */
export function GuideIndexSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/guide`,
        url: `${SITE_URL}/guide`,
        name: 'The SolanaSweeper Guide',
        description: 'A plain-English guide to Solana rent and reclaiming locked SOL.',
        publisher: ORG_REF,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: GUIDE_ARTICLES.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/guide/${a.slug}`,
            name: a.h1,
          })),
        },
      }}
    />
  );
}

/** Overzichtspagina /blog. */
export function BlogIndexSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/blog`,
        url: `${SITE_URL}/blog`,
        name: 'The SolanaSweeper Blog',
        description: 'Notes on Solana rent and reclaiming locked SOL.',
        publisher: ORG_REF,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: BLOG_ARTICLES.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/blog/${a.slug}`,
            name: a.title,
          })),
        },
      }}
    />
  );
}

/** Article + breadcrumb voor een guide-pagina. */
export function GuideSchema({ article }: { article: GuideArticle }) {
  const url = `${SITE_URL}/guide/${article.slug}`;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${url}#article`,
            headline: article.title,
            description: article.description,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
            author: ORG_REF,
            publisher: ORG_REF,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            isPartOf: {
              '@type': 'CreativeWork',
              name: 'The SolanaSweeper Guide',
              url: `${SITE_URL}/guide`,
            },
            image: OG_IMAGE,
            inLanguage: 'en',
          },
          breadcrumb([
            { name: 'Home', url: SITE_URL },
            { name: 'Guide', url: `${SITE_URL}/guide` },
            { name: article.h1, url },
          ]),
        ],
      }}
    />
  );
}

/** BlogPosting + breadcrumb voor een blogpost. */
export function BlogPostSchema({ article }: { article: BlogArticle }) {
  const url = `${SITE_URL}/blog/${article.slug}`;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            '@id': `${url}#article`,
            headline: article.title,
            description: article.description,
            datePublished: article.datePublished,
            dateModified: article.datePublished,
            author: ORG_REF,
            publisher: ORG_REF,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            image: OG_IMAGE,
            inLanguage: 'en',
          },
          breadcrumb([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: article.title, url },
          ]),
        ],
      }}
    />
  );
}
