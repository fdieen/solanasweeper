import type { Metadata } from 'next';
import InnerLayout from '@/components/InnerLayout';
import MapPin from '@/components/MapPin';
import RoadmapBackground from '@/components/RoadmapBackground';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Where SolSweep is headed: Fun Mode rent reclaim, Pro Mode swap & burn, a public reclaim counter, and a security audit.',
  alternates: { canonical: '/roadmap' },
};

type Status = 'done' | 'live' | 'building' | 'planned';

const items: { status: Status; label: string; title: string; body: string }[] = [
  {
    status: 'done',
    label: 'Shipped',
    title: 'Hero & landing page',
    body: 'Brand identity, hero animation, and the foundation of the site, fully live.',
  },
  {
    status: 'live',
    label: 'In progress',
    title: 'Fun Mode, rent reclaim',
    body: 'Connect wallet, scan empty token accounts, close them all, and SOL lands in your wallet. The safe core of SolSweep.',
  },
  {
    status: 'building',
    label: 'Next up',
    title: 'Pro Mode, swap & burn',
    body: 'Swap residual tokens to SOL via Jupiter. Permanently burn worthless SPL tokens and junk NFTs. Full irreversible-action confirmation before signing.',
  },
  {
    status: 'planned',
    label: 'Planned',
    title: 'Security audit',
    body: 'A full third-party audit of the on-chain logic and fee flow. We will not display an audit badge until this is complete.',
  },
  {
    status: 'planned',
    label: 'Planned',
    title: 'More wallet support',
    body: 'Expanding beyond Phantom, Solflare, and Backpack as the ecosystem grows.',
  },
  {
    status: 'planned',
    label: 'Planned',
    title: 'Live stats',
    body: 'A real-time counter of SOL reclaimed across all SolSweep users, once there is real data to show.',
  },
];

const statusStyle: Record<Status, { color: string; bg: string; dot: string }> = {
  done:     { color: '#14F195', bg: 'rgba(20,241,149,0.08)',  dot: '#14F195' },
  live:     { color: '#9945FF', bg: 'rgba(153,69,255,0.10)', dot: '#9945FF' },
  building: { color: 'rgba(255,255,255,0.65)', bg: 'rgba(255,255,255,0.05)', dot: 'rgba(255,255,255,0.4)' },
  planned:  { color: 'rgba(255,255,255,0.3)',  bg: 'rgba(255,255,255,0.03)', dot: 'rgba(255,255,255,0.15)' },
};

export default function Roadmap() {
  return (
    <InnerLayout bg="#06040d" bgNode={<RoadmapBackground />}>
      <MapPin />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(100px, 14vw, 160px) clamp(24px, 6vw, 80px) 80px' }}>

        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', marginBottom: '20px',
        }}>
          What&apos;s coming
        </p>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', letterSpacing: '-0.03em',
          lineHeight: 1.05, color: '#fff', marginBottom: '64px',
        }}>
          Roadmap
        </h1>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '7px', top: '12px', bottom: '12px', width: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {items.map(({ status, label, title, body }, i) => {
              const s = statusStyle[status];
              return (
                <div key={i} style={{ display: 'flex', gap: '28px', paddingBottom: '40px', position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    width: '15px', height: '15px', borderRadius: '50%',
                    background: s.dot,
                    border: `2px solid ${status === 'planned' ? 'rgba(255,255,255,0.08)' : s.dot}`,
                    flexShrink: 0, marginTop: '3px',
                    boxShadow: status === 'done' || status === 'live' ? `0 0 8px ${s.dot}` : 'none',
                  }} />

                  <div>
                    {/* Badge */}
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'General Sans, sans-serif', fontWeight: 600,
                      fontSize: '0.7rem', letterSpacing: '0.07em', textTransform: 'uppercase',
                      color: s.color, background: s.bg,
                      borderRadius: '999px', padding: '3px 10px',
                      marginBottom: '10px',
                    }}>
                      {label}
                    </span>

                    <h2 style={{
                      fontFamily: 'General Sans, sans-serif', fontWeight: 600,
                      fontSize: '1.05rem', letterSpacing: '-0.01em',
                      color: status === 'planned' ? 'rgba(255,255,255,0.4)' : '#fff',
                      marginBottom: '8px',
                    }}>
                      {title}
                    </h2>
                    <p style={{
                      fontFamily: 'General Sans, sans-serif', fontWeight: 400,
                      fontSize: '0.88rem', lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.35)',
                      maxWidth: '480px',
                    }}>
                      {body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{
          fontFamily: 'General Sans, sans-serif', fontWeight: 400,
          fontSize: '0.8rem', lineHeight: 1.7,
          color: 'rgba(255,255,255,0.22)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '32px', marginTop: '8px',
        }}>
          Roadmap is directional, not a commitment to specific dates. Priorities may shift.
        </p>
      </div>
    </InnerLayout>
  );
}
