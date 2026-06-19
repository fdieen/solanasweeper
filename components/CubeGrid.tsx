'use client';

import { useEffect, useRef } from 'react';
import type * as THREE_TYPE from 'three';

export default function CubeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let destroyed = false;
    let animFrameId: number;

    async function init() {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');

      if (destroyed || !canvasRef.current) return;
      const canvas = canvasRef.current;

      const isMobile = window.innerWidth < 768;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x04040a);

      const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(10, 13, 10);
      camera.lookAt(-2.5, 0, -2.5);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.5, 1.0, 0.05);
      if (!isMobile) composer.addPass(bloom);
      const renderFn = isMobile ? () => renderer.render(scene, camera) : () => composer.render();

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

      // Grid params
      const CUBE_W = 0.84, CUBE_H = 1.1, GAP = 1.06, GRID_R = 4;
      const MAX_LIFT = 3.2, RADIUS = isMobile ? 1.8 : 2.8;
      const C_TEAL = new THREE.Color(0x14F195);
      const C_PURPLE = new THREE.Color(0x9945FF);
      const BLACK = new THREE.Color(0x010103);
      const SOLANA_COLS = [C_TEAL, C_PURPLE];

      const bodyGeo = new THREE.BoxGeometry(CUBE_W, CUBE_H, CUBE_W);
      const bodyMats = [
        new THREE.MeshPhysicalMaterial({ color: 0x06120a, emissive: 0x14F195, emissiveIntensity: 0.0, metalness: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.08 }),
        new THREE.MeshPhysicalMaterial({ color: 0x07040f, emissive: 0x9945FF, emissiveIntensity: 0.0, metalness: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.08 }),
      ];

      const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
      (() => {
        const pos = edgesGeo.attributes.position.array as Float32Array;
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
      type GridItem = { pivot: THREE_TYPE.Group; col: number; row: number; mat: THREE_TYPE.MeshPhysicalMaterial; edgeIdle: THREE_TYPE.LineSegments; edgeGlow: THREE_TYPE.LineSegments; ci: number };
      const gridItems: GridItem[] = [];

      let cubeIdx = 0;
      for (let row = -GRID_R; row <= GRID_R; row++) {
        for (let col = -GRID_R; col <= GRID_R; col++) {
          if (Math.abs(row) + Math.abs(col) > GRID_R) continue;
          const ci = cubeIdx++ % 2;
          const mat = bodyMats[ci].clone() as THREE_TYPE.MeshPhysicalMaterial;
          const mesh = new THREE.Mesh(bodyGeo, mat);
          const edgeIdle = new THREE.LineSegments(edgesGeo, edgeMatIdle.clone());
          const edgeGlow = new THREE.LineSegments(edgesGeo, edgeMatsGlow[ci].clone());
          const pivot = new THREE.Group();
          pivot.add(mesh, edgeIdle, edgeGlow);
          pivot.position.set(col * GAP, 0, row * GAP);
          cubeGroup.add(pivot);
          gridItems.push({ pivot, col, row, mat, edgeIdle, edgeGlow, ci });
        }
      }

      // Platform glow
      const platCV = document.createElement('canvas');
      platCV.width = platCV.height = 256;
      const pc = platCV.getContext('2d')!;
      const gr = pc.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(20,241,149,0.35)');
      gr.addColorStop(0.5, 'rgba(153,69,255,0.2)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      pc.fillStyle = gr; pc.fillRect(0, 0, 256, 256);
      const platSize = (GRID_R * 2 + 1) * GAP + 0.5;
      const platform = new THREE.Mesh(
        new THREE.PlaneGeometry(platSize, platSize),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(platCV), transparent: true, depthWrite: false, side: THREE.DoubleSide })
      );
      platform.rotation.x = -Math.PI / 2;
      platform.position.y = -CUBE_H / 2 - 0.02;
      cubeGroup.add(platform);

      cubeGroup.rotation.y = Math.PI / 4;
      cubeGroup.scale.setScalar(0.72);
      cubeGroup.position.set(1.5, -1.5, 0);
      scene.add(cubeGroup);

      // Mouse
      const mouse3D = new THREE.Vector3(9999, 0, 9999);
      const raycaster = new THREE.Raycaster();
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      const onMouseMove = (e: MouseEvent) => {
        const ndc = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
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
        cubeGroup.rotation.y = Math.PI / 4 + t * 0.04;

        const localMouse = cubeGroup.worldToLocal(mouse3D.clone());

        gridItems.forEach(({ pivot, col, row, mat, edgeIdle, edgeGlow, ci }) => {
          const dx = pivot.position.x - localMouse.x;
          const dz = pivot.position.z - localMouse.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const inf = Math.max(0, 1 - dist / RADIUS);
          const smooth = inf * inf * (3 - 2 * inf);

          const idle = Math.sin(col * 0.85 + t * 0.9) * Math.cos(row * 0.85 + t * 0.72) * 0.28;
          pivot.position.y += (smooth * MAX_LIFT + idle - pivot.position.y) * 0.13;

          mat.color.copy(BLACK).lerp(SOLANA_COLS[ci], smooth * 0.22);
          mat.emissiveIntensity += (smooth * 0.7 - mat.emissiveIntensity) * 0.18;
          (edgeIdle.material as THREE_TYPE.LineBasicMaterial).opacity += (0.28 * (1 - smooth * 0.85) - (edgeIdle.material as THREE_TYPE.LineBasicMaterial).opacity) * 0.18;
          (edgeGlow.material as THREE_TYPE.LineBasicMaterial).opacity += (smooth - (edgeGlow.material as THREE_TYPE.LineBasicMaterial).opacity) * 0.18;

          const sx = 1 + smooth * 0.05;
          const sy = 1 + smooth * 0.12;
          pivot.scale.set(sx, sy, sx);
        });

        renderFn();
      }

      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        bloom.resolution.set(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        destroyed = true;
        cancelAnimationFrame(animFrameId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        renderer.dispose();
      };
    }

    const cleanup = init();
    return () => { destroyed = true; cleanup.then(fn => fn?.()); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
