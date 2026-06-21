'use client';

import { useEffect, useRef } from 'react';

type Pt   = [number, number];
type Path = Pt[];

export default function CircuitPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let destroyed = false;

    /* ── circuit pad-generator ── */
    function buildPaths(W: number, H: number): Path[] {
      // Vaste paden in % — allemaal rechte hoeken, spread over volledig scherm
      const pct: Array<Array<[number, number]>> = [
        // Links
        [[0,0.15],[0.06,0.15],[0.06,0.06],[0.16,0.06]],
        [[0,0.42],[0.08,0.42],[0.08,0.28],[0.18,0.28]],
        [[0,0.72],[0.07,0.72],[0.07,0.85],[0.16,0.85]],
        // Rechts
        [[1,0.18],[0.92,0.18],[0.92,0.08],[0.80,0.08]],
        [[1,0.48],[0.90,0.48],[0.90,0.35],[0.78,0.35]],
        [[1,0.75],[0.92,0.75],[0.92,0.88],[0.80,0.88]],
        // Boven
        [[0.28,0],[0.28,0.08],[0.40,0.08],[0.40,0.02]],
        [[0.58,0],[0.58,0.10],[0.70,0.10],[0.70,0.03]],
        // Onder
        [[0.25,1],[0.25,0.92],[0.38,0.92],[0.38,0.84]],
        [[0.62,1],[0.62,0.91],[0.74,0.91],[0.74,0.82]],
        // Hoeken wat verder naar binnen
        [[0.02,0.55],[0.12,0.55],[0.12,0.65],[0.20,0.65]],
        [[0.88,0.58],[0.78,0.58],[0.78,0.68],[0.70,0.68]],
      ];
      return pct.map(path => path.map(([px, py]) => [px * W, py * H] as Pt));
    }

    // Segmentlengten
    function segLens(path: Path) {
      const lens: number[] = [];
      for (let i = 1; i < path.length; i++)
        lens.push(Math.hypot(path[i][0]-path[i-1][0], path[i][1]-path[i-1][1]));
      return lens;
    }
    function totalLen(lens: number[]) { return lens.reduce((a,b)=>a+b,0); }

    function ptAt(path: Path, lens: number[], t: number): Pt {
      let d = t * totalLen(lens);
      for (let i = 0; i < lens.length; i++) {
        if (d <= lens[i]) {
          const r = d / lens[i];
          return [
            path[i][0] + (path[i+1][0]-path[i][0])*r,
            path[i][1] + (path[i+1][1]-path[i][1])*r,
          ];
        }
        d -= lens[i];
      }
      return path[path.length-1];
    }

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    let paths = buildPaths(W, H);
    let lensArr = paths.map(segLens);

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      paths = buildPaths(W, H);
      lensArr = paths.map(segLens);
    };
    window.addEventListener('resize', onResize);

    // Pulses
    type Pulse = { pi: number; t: number; trail: number[]; color: string };
    const pulses: Pulse[] = [];
    const COLORS = ['#14F195','#9945FF'];

    const spawn = () => {
      const pi    = Math.floor(Math.random() * paths.length);
      const color = COLORS[Math.floor(Math.random() * 2)];
      pulses.push({ pi, t: 0, trail: [], color });
    };

    const t0 = setTimeout(spawn, 400);
    const iv = setInterval(() => { spawn(); if (Math.random()<0.4) spawn(); }, 10000);

    let last = performance.now();

    function draw(now: number) {
      if (destroyed) return;
      animId = requestAnimationFrame(draw);
      const dt = Math.min(now - last, 40);
      last = now;

      ctx.clearRect(0, 0, W, H);

      // ── Statische lijnen & dots ──
      paths.forEach(path => {
        // Lijn
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.028)';
        ctx.lineWidth   = 1;
        ctx.lineCap     = 'square';
        ctx.lineJoin    = 'miter';
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]);
        ctx.stroke();
        ctx.restore();

        // Dot eindpunten
        [path[0], path[path.length-1]].forEach(([x,y]) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI*2);
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.lineWidth   = 1;
          ctx.stroke();
          ctx.restore();
        });
        // Tussenpunten kleiner bolletje
        for (let i = 1; i < path.length-1; i++) {
          const [x,y] = path[i];
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,0.035)';
          ctx.fill();
          ctx.restore();
        }
      });

      // ── Pulses ──
      for (let i = pulses.length-1; i >= 0; i--) {
        const p   = pulses[i];
        p.t      += 0.00065 * dt;
        p.trail.push(p.t);
        if (p.trail.length > 40) p.trail.shift();

        if (p.t >= 1) { pulses.splice(i,1); continue; }

        const path = paths[p.pi];
        const lens = lensArr[p.pi];
        const isTeal = p.color === '#14F195';

        // Oplichtende lijn
        ctx.save();
        ctx.strokeStyle = isTeal ? 'rgba(20,241,149,0.30)' : 'rgba(153,69,255,0.30)';
        ctx.lineWidth   = 1.5;
        ctx.lineCap     = 'square';
        ctx.lineJoin    = 'miter';
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let j = 1; j < path.length; j++) ctx.lineTo(path[j][0], path[j][1]);
        ctx.stroke();
        ctx.restore();

        // Trail
        p.trail.forEach((tp, ti) => {
          const alpha = (ti / p.trail.length) * 0.85;
          const [x,y] = ptAt(path, lens, Math.min(tp,1));
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI*2);
          ctx.fillStyle   = isTeal
            ? `rgba(20,241,149,${alpha})`
            : `rgba(153,69,255,${alpha})`;
          ctx.shadowBlur  = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        });

        // Kop
        const [hx,hy] = ptAt(path, lens, p.t);
        ctx.save();
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI*2);
        ctx.fillStyle   = '#fff';
        ctx.shadowBlur  = 20;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        // Oplichtende dot op eindpunt zodra pulse aankomt
        if (p.t > 0.92) {
          const [ex,ey] = path[path.length-1];
          const a = (p.t - 0.92) / 0.08;
          ctx.save();
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI*2);
          ctx.fillStyle   = isTeal
            ? `rgba(20,241,149,${a*0.9})`
            : `rgba(153,69,255,${a*0.9})`;
          ctx.shadowBlur  = 24;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      clearTimeout(t0);
      clearInterval(iv);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
