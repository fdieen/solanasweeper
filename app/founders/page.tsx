import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import FoundersSection from '@/components/FoundersSection';

const title = 'Founders';
const description =
  'The two people behind SolanaSweeper — Paul since 2016, Frank since 2017. Built by people who stayed through the crashes, the hacks, and the winters, and still ship code every day.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/founders' },
  openGraph: { type: 'website', title, description, url: '/founders' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function FoundersPage() {
  return (
    <InnerLayout>
      {/* Extra bovenmarge zodat de sectie net als /roadmap onder de fixed header
          uitkomt. Bewust hier op de pagina-wrapper, niet in FoundersSection zelf —
          die houdt zijn eigen sectie-padding voor plaatsing midden op een pagina.
          72–112px (sectie) + 28–48px (hier) ≈ /roadmap's clamp(100px, 14vw, 160px). */}
      <div style={{ paddingTop: 'clamp(28px, 4vw, 48px)' }}>
        <FoundersSection />
      </div>
    </InnerLayout>
  );
}
