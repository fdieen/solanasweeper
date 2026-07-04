'use client';

import { useEffect, useRef } from 'react';
import type * as THREE_T from 'three';

/**
 * GemCanvas — 3D brilliant-cut edelsteen.
 *
 * HD-pad (default op capabele devices): MeshPhysicalMaterial met echte transmissie
 * (glas), IOR 2.4 (diamant), dispersie (fire) en een PMREM-environment (RoomEnvironment)
 * voor realistische reflecties. De steen is KLEURLOOS/helder; het paars komt van buiten
 * (gekleurde lampen + rim-halo + de .hero-gem-glow achter de steen).
 *
 * FALLBACK-pad: de oude MeshStandardMaterial + geschilderde canvas-env. Transmissie en
 * PMREM leunen op half-float render targets die op sommige iOS Safari-builds (o.a. de
 * Phantom in-app browser) onbetrouwbaar zijn — daarom eerst een capability-check +
 * try/catch, en bij twijfel automatisch terugvallen op deze betrouwbare versie.
 *
 * Test-override via URL: ?gem=basic forceert de fallback, ?gem=hd forceert het HD-pad
 * (om op hetzelfde toestel te vergelijken).
 */
export default function GemCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;
    let animId: number;

    async function init() {
      const THREE = await import('three');
      const { mergeGeometries } = await import('three/examples/jsm/utils/BufferGeometryUtils.js');
      if (destroyed || !canvas) return;

      const isMobile = window.innerWidth < 768;
      const W = canvas.offsetWidth || 360;
      const H = canvas.offsetHeight || 360;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      // Transmissie is duurder (rendert de scene extra) → DPR wat lager op mobiel.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
      camera.position.set(0, 2.4, 5.4);
      camera.lookAt(0, -0.1, 0);

      // Lights (brand-tint) — voor beide paden. De steen is kleurloos, dus ZIJN kleur
      // komt vooral hiervandaan: gekleurde reflecties/sparkles op de facetten. Iets
      // sterker dan voorheen zodat het paars/cyaan/roze duidelijk in de heldere steen speelt.
      scene.add(new THREE.AmbientLight(0xffffff, 0.28));
      const lW = new THREE.DirectionalLight(0xffffff, 1.6); lW.position.set(3, 6, 5); scene.add(lW);
      const lT = new THREE.PointLight(0x35ffc8, 34, 40); lT.position.set(-5, 2, 4); scene.add(lT);
      const lP = new THREE.PointLight(0xc79bff, 50, 40); lP.position.set(4, 0, 5); scene.add(lP);
      const lPink = new THREE.PointLight(0xff7be0, 30, 40); lPink.position.set(2, -3, 4); scene.add(lPink);

      // ── Geometry: brilliant-cut, fijnere facetten (24 mobiel / 32 desktop) ──
      const SEG = isMobile ? 24 : 32;
      const gCrown = new THREE.CylinderGeometry(0.6, 1.1, 0.5, SEG); gCrown.translate(0, 0.55, 0);
      const gGirdle = new THREE.CylinderGeometry(1.1, 1.1, 0.12, SEG); gGirdle.translate(0, 0.24, 0);
      const gPav = new THREE.ConeGeometry(1.1, 1.75, SEG); gPav.rotateX(Math.PI); gPav.translate(0, -0.69, 0);
      const gemGeo = mergeGeometries([gCrown, gGirdle, gPav], false);

      // ── Fallback-env: geschilderde equirect canvas-texture (huidige look) ──
      function buildFallbackEnv(): THREE_T.Texture {
        const envCv = document.createElement('canvas'); envCv.width = 512; envCv.height = 256;
        const ec = envCv.getContext('2d')!;
        const eg = ec.createLinearGradient(0, 0, 0, 256);
        eg.addColorStop(0, '#e9d6ff'); eg.addColorStop(0.35, '#8a52e0'); eg.addColorStop(0.55, '#1a0f33');
        eg.addColorStop(0.8, '#5a86ff'); eg.addColorStop(1, '#16d6a0');
        ec.fillStyle = eg; ec.fillRect(0, 0, 512, 256);
        const spots: [number, number, number, string][] = [
          [120, 55, 34, 'rgba(255,255,255,0.95)'], [370, 45, 24, 'rgba(255,255,255,0.9)'], [60, 150, 18, 'rgba(255,255,255,0.7)'],
          [210, 40, 14, 'rgba(255,255,255,0.8)'], [440, 90, 16, 'rgba(255,255,255,0.75)'], [300, 200, 22, 'rgba(255,150,230,0.7)'],
          [180, 120, 30, 'rgba(180,140,255,0.6)'], [470, 200, 18, 'rgba(120,220,255,0.7)'], [30, 60, 12, 'rgba(200,255,240,0.6)'],
        ];
        for (const [x, y, rr, col] of spots) { ec.fillStyle = col; ec.beginPath(); ec.arc(x, y, rr, 0, Math.PI * 2); ec.fill(); }
        const t = new THREE.CanvasTexture(envCv); t.mapping = THREE.EquirectangularReflectionMapping; return t;
      }

      // ── Capability-check: transmissie + PMREM hebben (half-)float render targets nodig.
      // Op iOS Safari alleen betrouwbaar met EXT_color_buffer_(half_)float. Bij twijfel: fallback.
      const params = new URLSearchParams(window.location.search);
      const forceBasic = params.get('gem') === 'basic';
      const forceHd = params.get('gem') === 'hd';
      const hasFloatTarget =
        !!renderer.extensions.get('EXT_color_buffer_float') ||
        !!renderer.extensions.get('EXT_color_buffer_half_float');
      const wantAdvanced = !forceBasic && (forceHd || (renderer.capabilities.isWebGL2 && hasFloatTarget));

      let mat: THREE_T.MeshPhysicalMaterial | THREE_T.MeshStandardMaterial | undefined;
      let usedAdvanced = false;
      let pmrem: THREE_T.PMREMGenerator | null = null;
      let envRT: THREE_T.WebGLRenderTarget | null = null;
      let fallbackEnvTex: THREE_T.Texture | null = null;

      if (wantAdvanced) {
        try {
          const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
          pmrem = new THREE.PMREMGenerator(renderer);
          const roomEnv = new RoomEnvironment();
          envRT = pmrem.fromScene(roomEnv, 0.04);
          roomEnv.dispose?.();
          scene.environment = envRT.texture; // achtergrond voor de transmissie
          mat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,               // KLEURLOOS/wit — de steen zelf blijft helder
            metalness: 0.0,
            roughness: 0.0,                // spiegelglad → scherpe fonkeling
            transmission: 1,               // echt glas
            ior: 2.4,                      // diamant
            thickness: 1.2,                // afgestemd op de schaal
            dispersion: isMobile ? 1.2 : 3.0, // "fire" (regenboog) — mobiel getemperd (extra samples = kost)
            // GEEN attenuationColor/emissive → geen kleur in het glas; het paars komt van
            // de gekleurde lampen + rim-mesh + de .hero-gem-glow achter de steen.
            envMap: envRT.texture,
            envMapIntensity: 1.4,
            side: THREE.DoubleSide,
            flatShading: true,             // scherpe facetten behouden
          });
          usedAdvanced = true;
        } catch (e) {
          console.warn('[gem] HD-pad (transmission/PMREM) niet beschikbaar → fallback', e);
          pmrem?.dispose(); pmrem = null;
          envRT?.dispose(); envRT = null;
          scene.environment = null;
        }
      }

      if (!usedAdvanced) {
        fallbackEnvTex = buildFallbackEnv();
        mat = new THREE.MeshStandardMaterial({
          color: 0x2a1248, metalness: 0.0, roughness: 0.06, envMap: fallbackEnvTex, envMapIntensity: 1.15,
          emissive: 0x140626, emissiveIntensity: 0.12, transparent: true, opacity: 0.86,
          side: THREE.DoubleSide, flatShading: true,
        });
      }

      const gem = new THREE.Group();
      const gemMesh = new THREE.Mesh(gemGeo, mat!);
      gem.add(gemMesh);

      // Gloeiende rand (fresnel-look) — beide paden. Subtiele paarse halo: het paars
      // van buiten, niet in het glas.
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0xb98cff, transparent: true, opacity: 0.46, side: THREE.BackSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const rim = new THREE.Mesh(gemGeo, rimMat);
      rim.scale.setScalar(1.035);
      gem.add(rim);

      gem.scale.setScalar(0.82);
      scene.add(gem);

      // Spin via hover-event uit CircuitBackground
      const idleVel = 0.006;
      let vel = idleVel;
      const onSpin = () => { vel += 0.42; };
      window.addEventListener('gem-spin', onSpin);

      const clock = new THREE.Clock();
      let paused = false;
      const onVis = () => { paused = document.hidden; if (!paused) clock.getDelta(); };
      document.addEventListener('visibilitychange', onVis);

      function animate() {
        if (destroyed) return;
        animId = requestAnimationFrame(animate);
        if (paused) return;
        const tt = clock.getElapsedTime();
        vel += (idleVel - vel) * 0.02;
        gem.rotation.y += vel;
        gem.rotation.x = Math.sin(tt * 0.45) * 0.09;
        gem.position.y = Math.sin(tt * 1.3) * 0.06;
        renderer.render(scene, camera);
      }
      animate();

      const onResize = () => {
        if (!canvas) return;
        const W2 = canvas.offsetWidth, H2 = canvas.offsetHeight;
        if (!W2 || !H2) return;
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
        renderer.setSize(W2, H2, false);
      };
      window.addEventListener('resize', onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(canvas);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('gem-spin', onSpin);
        document.removeEventListener('visibilitychange', onVis);
        ro.disconnect();
        gemGeo.dispose();
        mat?.dispose();
        rimMat.dispose();
        fallbackEnvTex?.dispose();
        envRT?.dispose();
        pmrem?.dispose();
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });
    return () => { destroyed = true; cleanup?.(); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
