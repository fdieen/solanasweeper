'use client';

import { useEffect, useRef } from 'react';

/**
 * GemCanvas — 3D brilliant-cut edelsteen (paars, glasachtig, geslepen facetten).
 * Reflecties via een gekleurde env-map (zonder PMREM, betrouwbaar in Safari).
 * Draait continu in 3D; hover geeft een fidget-spin die uitloopt.
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

      const W = canvas.offsetWidth || 360;
      const H = canvas.offsetHeight || 360;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
      camera.position.set(0, 2.4, 5.4);
      camera.lookAt(0, -0.1, 0);

      // Gekleurde env-map (geen PMREM): glasachtige reflecties + iridescente highlights
      const envCv = document.createElement('canvas');
      envCv.width = 512; envCv.height = 256;
      const ec = envCv.getContext('2d')!;
      const eg = ec.createLinearGradient(0, 0, 0, 256);
      eg.addColorStop(0, '#e9d6ff');
      eg.addColorStop(0.35, '#8a52e0');
      eg.addColorStop(0.55, '#1a0f33');
      eg.addColorStop(0.8, '#5a86ff');
      eg.addColorStop(1, '#16d6a0');
      ec.fillStyle = eg; ec.fillRect(0, 0, 512, 256);
      // Veel highlight-vlekken → sprankelende glans/reflecties op de facetten
      const spots: [number, number, number, string][] = [
        [120, 55, 34, 'rgba(255,255,255,0.95)'],
        [370, 45, 24, 'rgba(255,255,255,0.9)'],
        [60, 150, 18, 'rgba(255,255,255,0.7)'],
        [210, 40, 14, 'rgba(255,255,255,0.8)'],
        [440, 90, 16, 'rgba(255,255,255,0.75)'],
        [300, 200, 22, 'rgba(255,150,230,0.7)'],
        [180, 120, 30, 'rgba(180,140,255,0.6)'],
        [470, 200, 18, 'rgba(120,220,255,0.7)'],
        [30, 60, 12, 'rgba(200,255,240,0.6)'],
      ];
      for (const [x, y, rr, col] of spots) {
        ec.fillStyle = col; ec.beginPath(); ec.arc(x, y, rr, 0, Math.PI * 2); ec.fill();
      }
      const envTex = new THREE.CanvasTexture(envCv);
      envTex.mapping = THREE.EquirectangularReflectionMapping;

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const lW = new THREE.DirectionalLight(0xffffff, 1.5); lW.position.set(3, 6, 5); scene.add(lW);
      const lT = new THREE.PointLight(0x35ffc8, 35, 40); lT.position.set(-5, 2, 4); scene.add(lT);
      const lP = new THREE.PointLight(0xc79bff, 45, 40); lP.position.set(4, 0, 5); scene.add(lP);
      const lPink = new THREE.PointLight(0xff7be0, 28, 40); lPink.position.set(2, -3, 4); scene.add(lPink);

      const gem = new THREE.Group();

      // Brilliant-cut: kroon + girdle + paviljoen samengevoegd tot één glaslichaam
      const SEG = 12;
      const gCrown = new THREE.CylinderGeometry(0.6, 1.1, 0.5, SEG);
      gCrown.translate(0, 0.55, 0);
      const gGirdle = new THREE.CylinderGeometry(1.1, 1.1, 0.12, SEG);
      gGirdle.translate(0, 0.24, 0);
      const gPav = new THREE.ConeGeometry(1.1, 1.75, SEG);
      gPav.rotateX(Math.PI);
      gPav.translate(0, -0.69, 0);
      const gemGeo = mergeGeometries([gCrown, gGirdle, gPav], false);

      // Donker, doorschijnend amethist-lichaam (zoals de referentie)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2a1248,
        metalness: 0.0,
        roughness: 0.06,
        envMap: envTex,
        envMapIntensity: 1.15,
        emissive: 0x140626,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.86,
        side: THREE.DoubleSide,   // achterfacetten zichtbaar → diepte
        flatShading: true,
      });
      const gemMesh = new THREE.Mesh(gemGeo, mat);
      gem.add(gemMesh);

      // Gloeiende rand (fresnel-look) — bright edges zoals in de foto
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0xb98cff,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const rim = new THREE.Mesh(gemGeo, rimMat);
      rim.scale.setScalar(1.035);
      gem.add(rim);

      gem.scale.setScalar(0.82); // iets kleiner
      scene.add(gem);

      // Spin wordt aangestuurd door de hover-detectie in CircuitBackground (event)
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
        gem.rotation.x = Math.sin(tt * 0.45) * 0.09; // subtiele kanteling → facetten vangen licht
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
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });
    return () => { destroyed = true; cleanup?.(); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
