'use client';

/**
 * WaveBot — roadmap-mascotte
 * --------------------------
 * Schattige zwarte robot met glimlachend glow-gezicht, koptelefoon-oortjes
 * en een glow-ring op de borst. Op hover zwaait hij met zijn linkerarm.
 */
export default function WaveBot() {
  const dark = 'linear-gradient(155deg, #3a3a40 0%, #1a1a1e 55%, #050506 100%)';

  return (
    <div className="wave-bot">
      <style>{`
        @keyframes wavebot-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes wavebot-arm {
          0%   { transform: rotate(-8deg); }
          12%  { transform: rotate(125deg); }
          28%  { transform: rotate(105deg); }
          44%  { transform: rotate(128deg); }
          60%  { transform: rotate(105deg); }
          76%  { transform: rotate(125deg); }
          100% { transform: rotate(-8deg); }
        }
        @keyframes wavebot-earpulse { 0%,100% { opacity: 1; box-shadow: 0 0 8px rgba(255,255,255,0.8); } 50% { opacity: 0.5; box-shadow: 0 0 3px rgba(255,255,255,0.4); } }

        .wave-bot {
          position: absolute;
          top: 90px;
          right: clamp(8px, 5vw, 70px);
          z-index: 5;
          user-select: none;
        }
        @media (max-width: 880px) {
          .wave-bot { position: relative; top: 0; right: 0; margin: 0 auto 24px; display: flex; justify-content: center; transform: scale(0.85); }
        }

        .wave-bot .arm-left {
          transform: rotate(-8deg);
          transition: transform 0.3s ease;
        }
        .wave-bot:hover .arm-left {
          animation: wavebot-arm 1.4s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        position: 'relative',
        width: '210px',
        height: '260px',
        animation: 'wavebot-float 4s ease-in-out infinite',
        cursor: 'pointer',
      }}>
        {/* ===== Body ===== */}
        <div style={{
          position: 'absolute',
          bottom: '0', left: '50%', transform: 'translateX(-50%)',
          width: '140px', height: '120px',
          background: dark,
          borderRadius: '46% 46% 42% 42% / 40% 40% 60% 60%',
          boxShadow: '0 24px 50px rgba(0,0,0,0.55), inset 0 6px 12px rgba(255,255,255,0.12), inset 0 -10px 18px rgba(0,0,0,0.6)',
        }}>
          {/* Borst-ring */}
          <div style={{
            position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
            width: '34px', height: '34px', borderRadius: '50%',
            border: '6px solid #fff',
            boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(20,241,149,0.5), inset 0 0 6px rgba(20,241,149,0.6)',
            background: 'transparent',
          }} />
        </div>

        {/* ===== Rechterarm (vast, naar beneden) ===== */}
        <div style={{
          position: 'absolute', bottom: '34px', right: '24px',
          width: '20px', height: '70px',
          background: dark,
          borderRadius: '12px',
          transform: 'rotate(-10deg)',
          transformOrigin: 'top center',
          boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)',
          zIndex: 1,
        }} />

        {/* ===== Linkerarm (zwaait bij hover) ===== */}
        <div className="arm-left" style={{
          position: 'absolute', bottom: '46px', left: '24px',
          width: '20px', height: '70px',
          background: dark,
          borderRadius: '12px',
          transformOrigin: 'top center',
          boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)',
          zIndex: 1,
        }}>
          {/* Hand */}
          <div style={{
            position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)',
            width: '24px', height: '22px',
            background: dark,
            borderRadius: '50% 50% 45% 45%',
            boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.5)',
          }} />
        </div>

        {/* ===== Oortjes ===== */}
        <div style={{
          position: 'absolute', top: '50px', left: '4px',
          width: '24px', height: '54px', background: dark,
          borderRadius: '12px',
          boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '5px', height: '30px', borderRadius: '3px', background: '#fff', animation: 'wavebot-earpulse 2s ease-in-out infinite' }} />
        </div>
        <div style={{
          position: 'absolute', top: '50px', right: '4px',
          width: '24px', height: '54px', background: dark,
          borderRadius: '12px',
          boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '5px', height: '30px', borderRadius: '3px', background: '#fff', animation: 'wavebot-earpulse 2s ease-in-out infinite 0.5s' }} />
        </div>

        {/* ===== Hoofd ===== */}
        <div style={{
          position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)',
          width: '150px', height: '128px',
          background: dark,
          borderRadius: '50% 50% 48% 48% / 54% 54% 46% 46%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.55), inset 0 8px 16px rgba(255,255,255,0.14), inset 0 -10px 20px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          {/* Gezicht-scherm */}
          <div style={{
            width: '112px', height: '94px',
            background: 'radial-gradient(ellipse at 35% 25%, #16161c 0%, #050507 70%)',
            borderRadius: '50%',
            boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.25)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Glans */}
            <div style={{ position: 'absolute', top: '10px', left: '18px', width: '36px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(2px)' }} />

            {/* Gezicht: ^^ ogen + glimlach */}
            <svg width="86" height="60" viewBox="0 0 86 60" fill="none" style={{ marginTop: '6px' }}>
              {/* Linker oog */}
              <path d="M14 26 Q22 16 30 26" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 4px rgba(20,241,149,0.7))' }} />
              {/* Rechter oog */}
              <path d="M56 26 Q64 16 72 26" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 4px rgba(20,241,149,0.7))' }} />
              {/* Glimlach */}
              <path d="M30 40 Q43 54 56 40" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 5px rgba(20,241,149,0.7))' }} />
            </svg>
          </div>
        </div>

        {/* Antenne-knopje boven */}
        <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#14F195', boxShadow: '0 0 8px 2px rgba(20,241,149,0.7)', zIndex: 3 }} />
      </div>
    </div>
  );
}
