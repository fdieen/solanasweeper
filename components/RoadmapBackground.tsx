'use client';

/**
 * RoadmapBackground — eigen sfeer voor de roadmap, anders dan de andere secties.
 * Langzaam bewegende diagonale Solana-kleur-sweep + subtiel grid + horizonglow.
 */
export default function RoadmapBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      <style>{`
        @keyframes road-sweep { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
      `}</style>

      {/* Basis-lift: maakt de hele pagina lichter */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 80% at 50% 35%, rgba(80,50,140,0.28) 0%, rgba(40,25,80,0.12) 55%, transparent 85%)',
      }} />

      {/* Diagonale bewegende kleurbanden */}
      <div style={{
        position: 'absolute', inset: '-40%',
        background: `linear-gradient(115deg,
          rgba(153,69,255,0.0) 0%,
          rgba(153,69,255,0.28) 18%,
          rgba(20,241,149,0.0) 34%,
          rgba(120,40,255,0.24) 52%,
          rgba(20,241,149,0.18) 68%,
          rgba(153,69,255,0.0) 86%
        )`,
        backgroundSize: '200% 200%',
        animation: 'road-sweep 24s linear infinite',
        filter: 'blur(40px)',
        willChange: 'background-position',
        transform: 'translateZ(0)',
      }} />

      {/* Subtiel grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '46px 46px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)',
      }} />

      {/* Horizon-glow onderaan */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%',
        background: 'linear-gradient(0deg, rgba(140,60,255,0.24) 0%, transparent 100%)',
      }} />

      {/* Lichte vignette voor leesbaarheid (subtieler) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 85% 85% at 50% 45%, transparent 50%, rgba(4,4,10,0.4) 100%)',
      }} />
    </div>
  );
}
