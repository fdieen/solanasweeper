import Header from './Header';
import Footer from './Footer';

const defaultBg = `
  radial-gradient(ellipse 60% 40% at 15% 100%, rgba(153,69,255,0.12) 0%, transparent 60%),
  radial-gradient(ellipse 50% 35% at 85% 100%, rgba(20,241,149,0.10) 0%, transparent 55%)
`;

export default function InnerLayout({ children, bg, bgNode }: { children: React.ReactNode; bg?: string; bgNode?: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#04040a', display: 'flex', flexDirection: 'column' }}>
      {/* Subtle bg texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: bg ?? defaultBg,
      }} />
      {/* Optionele extra achtergrondlaag (bv. aurora) */}
      {bgNode}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
