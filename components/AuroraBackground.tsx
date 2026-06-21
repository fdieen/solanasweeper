'use client';

/**
 * AuroraBackground — zachte, langzaam driftende kleurvlekken in Solana-kleuren.
 * Bedoeld als sfeervolle achtergrondlaag (z-0), subtiel maar levendig.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes aurora-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8vw, 6vh) scale(1.15); } }
        @keyframes aurora-2 { 0%,100% { transform: translate(0,0) scale(1.1); } 50% { transform: translate(-7vw, -5vh) scale(0.9); } }
        @keyframes aurora-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5vw, -7vh) scale(1.2); } }
        @keyframes aurora-4 { 0%,100% { transform: translate(0,0) scale(0.95); } 50% { transform: translate(-6vw, 8vh) scale(1.1); } }
      `}</style>

      <div style={{
        position: 'absolute', top: '-20%', left: '-15%',
        width: '85vw', height: '85vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(153,69,255,0.30) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'aurora-1 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '5%', right: '-20%',
        width: '80vw', height: '80vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,241,149,0.22) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'aurora-2 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-25%', left: '5%',
        width: '95vw', height: '95vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,40,255,0.26) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'aurora-3 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '25%',
        width: '65vw', height: '65vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,241,149,0.14) 0%, transparent 70%)',
        filter: 'blur(65px)',
        animation: 'aurora-4 26s ease-in-out infinite',
      }} />

      {/* Lichte vignette zodat de tekst leesbaar blijft */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(4,4,10,0.55) 100%)',
      }} />
    </div>
  );
}
