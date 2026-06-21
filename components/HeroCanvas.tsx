'use client';

import { useEffect, useRef } from 'react';
import type * as THREE_TYPE from 'three';

type Props = {
  /** Geen gebakken gradient-achtergrond; canvas is transparant */
  transparent?: boolean;
  /** Waar de camera naar kijkt — bepaalt waar de cubes in beeld staan */
  lookAt?: [number, number, number];
  /** Bar-modus: breed, ondiep rooster dat een hele balk vult */
  bar?: boolean;
};

export default function HeroCanvas({ transparent = false, lookAt = [-5.5, -2.5, 0], bar = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;
    let animFrameId: number;

    async function init() {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');

      if (destroyed || !canvas) return;

      const isMobile = window.innerWidth < 768;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: transparent });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(W, H, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const scene = new THREE.Scene();

      if (transparent) {
        renderer.setClearColor(0x000000, 0);
      } else {
        // Gradient als scene background — altijd zichtbaar, ook via EffectComposer
        const bgCv = document.createElement('canvas');
        bgCv.width = 2048; bgCv.height = 2048;
        const bgCtx = bgCv.getContext('2d')!;
        bgCtx.fillStyle = '#04040a';
        bgCtx.fillRect(0, 0, 2048, 2048);
        // Grote paarse glow, breed over de onderkant
        const g1 = bgCtx.createRadialGradient(900, 2048, 0, 900, 2048, 1600);
        g1.addColorStop(0,   'rgba(100,25,210,0.30)');
        g1.addColorStop(0.4, 'rgba(70,15,160,0.12)');
        g1.addColorStop(0.7, 'rgba(50,8,120,0.05)');
        g1.addColorStop(1,   'rgba(30,4,90,0)');
        bgCtx.fillStyle = g1; bgCtx.fillRect(0, 0, 2048, 2048);
        const g2 = bgCtx.createRadialGradient(200, 1800, 0, 200, 1800, 900);
        g2.addColorStop(0,   'rgba(80,18,190,0.16)');
        g2.addColorStop(0.5, 'rgba(55,10,140,0.06)');
        g2.addColorStop(1,   'rgba(35,4,90,0)');
        bgCtx.fillStyle = g2; bgCtx.fillRect(0, 0, 2048, 2048);
        const g3 = bgCtx.createRadialGradient(2048, 2048, 0, 2048, 2048, 700);
        g3.addColorStop(0,   'rgba(20,241,149,0.06)');
        g3.addColorStop(0.5, 'rgba(20,241,149,0.02)');
        g3.addColorStop(1,   'rgba(20,241,149,0)');
        bgCtx.fillStyle = g3; bgCtx.fillRect(0, 0, 2048, 2048);
        const bgTex = new THREE.CanvasTexture(bgCv);
        bgTex.minFilter = THREE.LinearFilter;
        bgTex.magFilter = THREE.LinearFilter;
        scene.background = bgTex;
      }

      const camera = new THREE.PerspectiveCamera(bar ? 30 : 42, W / H, 0.1, 200);
      if (bar) {
        // Schuin van bovenaf, dichtbij zodat grote cubes de hele balk vullen
        camera.position.set(0, 9, 13);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(10, 13, 10);
        camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
      }

      const useComposer = !isMobile;
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 1.15, 0.7, 0.1);
      if (useComposer) composer.addPass(bloom);
      // OutputPass behoudt de alpha door de bloom heen (transparante variant)
      if (useComposer && transparent) composer.addPass(new OutputPass());
      const renderFn = useComposer ? () => composer.render() : () => renderer.render(scene, camera);

      // Lights
      scene.add(new THREE.AmbientLight(0x0a0a18, 0.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
      keyLight.position.set(8, 14, 4);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0x2233aa, 0.6);
      fillLight.position.set(-6, 2, -4);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x14F195, 0.4);
      rimLight.position.set(-3, 6, -8);
      scene.add(rimLight);

      const CUBE_W = 0.84, CUBE_H = 1.1, GAP = 1.06, GRID_R = 4;
      // Bar-modus: breed/ondiep rechthoekig rooster met grote cubes
      const BAR_COLS = 14, BAR_ROWS = 2;
      const MAX_LIFT = bar ? 1.6 : 3.2, RADIUS = isMobile ? 1.8 : 2.8;
      const C_TEAL   = new THREE.Color(0x14F195);
      const C_PURPLE = new THREE.Color(0x9945FF);
      const BLACK    = new THREE.Color(0x010103);
      const SOLANA_COLS = [C_TEAL, C_PURPLE];

      const bodyGeo  = new THREE.BoxGeometry(CUBE_W, CUBE_H, CUBE_W);
      const bodyMats = [
        new THREE.MeshPhysicalMaterial({ color: 0x06120a, emissive: 0x14F195, emissiveIntensity: 0.0, metalness: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.08 }),
        new THREE.MeshPhysicalMaterial({ color: 0x07040f, emissive: 0x9945FF, emissiveIntensity: 0.0, metalness: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.08 }),
      ];

      const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
      (() => {
        const pos  = edgesGeo.attributes.position.array as Float32Array;
        const cols = new Float32Array(pos.length);
        for (let i = 0; i < pos.length; i += 3) {
          const t = (pos[i + 1] + CUBE_H / 2) / CUBE_H;
          const c = C_TEAL.clone().lerp(C_PURPLE, 1 - t);
          cols[i] = c.r; cols[i + 1] = c.g; cols[i + 2] = c.b;
        }
        edgesGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      })();

      const edgeMatIdle = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.30 });
      const edgeMatsGlow = [
        new THREE.LineBasicMaterial({ color: 0x14F195, transparent: true, opacity: 0.0 }),
        new THREE.LineBasicMaterial({ color: 0x9945FF, transparent: true, opacity: 0.0 }),
      ];

      const cubeGroup = new THREE.Group();
      type GridItem = {
        pivot: InstanceType<typeof THREE.Group>;
        col: number; row: number;
        mat: THREE_TYPE.MeshPhysicalMaterial;
        edgeIdle: THREE_TYPE.LineSegments;
        edgeGlow: THREE_TYPE.LineSegments;
        ci: number;
      };
      const gridItems: GridItem[] = [];

      let cubeIdx = 0;
      const rowMax = bar ? BAR_ROWS : GRID_R;
      const colMax = bar ? BAR_COLS : GRID_R;
      for (let row = -rowMax; row <= rowMax; row++) {
        for (let col = -colMax; col <= colMax; col++) {
          if (!bar && Math.abs(row) + Math.abs(col) > GRID_R) continue;
          const ci      = cubeIdx++ % 2;
          const mat     = bodyMats[ci].clone() as THREE_TYPE.MeshPhysicalMaterial;
          const mesh    = new THREE.Mesh(bodyGeo, mat);
          const edgeIdle = new THREE.LineSegments(edgesGeo, edgeMatIdle.clone());
          const edgeGlow = new THREE.LineSegments(edgesGeo, edgeMatsGlow[ci].clone());
          const pivot    = new THREE.Group();
          pivot.add(mesh, edgeIdle, edgeGlow);
          pivot.position.set(col * GAP, 0, row * GAP);
          cubeGroup.add(pivot);
          gridItems.push({ pivot, col, row, mat, edgeIdle, edgeGlow, ci });
        }
      }


      cubeGroup.rotation.y = bar ? 0 : Math.PI / 4;
      cubeGroup.scale.setScalar(bar ? 1 : 0.82);
      scene.add(cubeGroup);

      // Mouse — relatief aan de canvas, niet aan het window
      const mouse3D    = new THREE.Vector3(9999, 0, 9999);
      const raycaster  = new THREE.Raycaster();
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const ndc  = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width)  * 2 - 1,
          -((e.clientY - rect.top)  / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);
        raycaster.ray.intersectPlane(groundPlane, mouse3D);
      };
      window.addEventListener('mousemove', onMouseMove);

      const clock = new THREE.Clock();
      let paused = false;
      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const onVisibility = () => { paused = document.hidden; if (!paused) clock.getDelta(); };
      document.addEventListener('visibilitychange', onVisibility);

      function animate() {
        if (destroyed) return;
        animFrameId = requestAnimationFrame(animate);
        if (paused) return;

        const t = prefersReduced ? 0 : clock.getElapsedTime();
        if (!bar) cubeGroup.rotation.y = Math.PI / 4 + t * 0.04;

        const localMouse = cubeGroup.worldToLocal(mouse3D.clone());

        gridItems.forEach(({ pivot, col, row, mat, edgeIdle, edgeGlow, ci }) => {
          const dx   = pivot.position.x - localMouse.x;
          const dz   = pivot.position.z - localMouse.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const inf    = Math.max(0, 1 - dist / RADIUS);
          const smooth = inf * inf * (3 - 2 * inf);

          const idle = Math.sin(col * 0.85 + t * 0.9) * Math.cos(row * 0.85 + t * 0.72) * 0.04;
          pivot.position.y += (smooth * MAX_LIFT + idle - pivot.position.y) * 0.13;

          // Zonder bloom (mobiel) compenseren we met sterkere emissive/edge
          const gb = useComposer ? 1 : 1.7;
          mat.color.copy(BLACK).lerp(SOLANA_COLS[ci], smooth * 0.18 * gb);
          mat.emissiveIntensity += (smooth * 0.36 * gb - mat.emissiveIntensity) * 0.18;
          (edgeIdle.material as THREE_TYPE.LineBasicMaterial).opacity += (Math.min(1, 0.28 * (1 - smooth * 0.75) * (useComposer ? 1 : 1.5)) - (edgeIdle.material as THREE_TYPE.LineBasicMaterial).opacity) * 0.18;
          (edgeGlow.material as THREE_TYPE.LineBasicMaterial).opacity += (Math.min(1, smooth * 0.6 * gb) - (edgeGlow.material as THREE_TYPE.LineBasicMaterial).opacity) * 0.18;

          const sx = 1 + smooth * 0.05;
          pivot.scale.set(sx, 1 + smooth * 0.12, sx);
        });

        renderFn();
      }

      animate();

      const onResize = () => {
        if (!canvas) return;
        const W2 = canvas.offsetWidth;
        const H2 = canvas.offsetHeight;
        if (W2 === 0 || H2 === 0) return;
        camera.aspect = W2 / H2;
        camera.updateProjectionMatrix();
        renderer.setSize(W2, H2, false);
        composer.setSize(W2, H2);
        bloom.resolution.set(W2, H2);
      };
      window.addEventListener('resize', onResize);

      // ResizeObserver: pakt direct de juiste grootte, ook als layout nog niet klaar was bij init
      const ro = new ResizeObserver(() => onResize());
      ro.observe(canvas);

      return () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        ro.disconnect();
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });
    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
