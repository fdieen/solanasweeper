'use client';

import { useEffect, useRef } from 'react';

/**
 * KeyCanvas — 3D sleutel die langzaam ronddraait.
 * Transparant canvas, metallic met Solana-getinte glow.
 */
export default function KeyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;
    let animId: number;

    async function init() {
      const THREE = await import('three');
      if (destroyed || !canvas) return;

      const W = canvas.offsetWidth || 160;
      const H = canvas.offsetHeight || 160;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
      camera.position.set(0, 0, 10.5);
      camera.lookAt(0, 0, 0);

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const key1 = new THREE.DirectionalLight(0xffffff, 2.2);
      key1.position.set(4, 6, 6);
      scene.add(key1);
      const teal = new THREE.PointLight(0x14F195, 18, 30);
      teal.position.set(-4, 2, 4);
      scene.add(teal);
      const purple = new THREE.PointLight(0x9945FF, 18, 30);
      purple.position.set(4, -3, 3);
      scene.add(purple);

      // Materiaal: glanzend metaal met lichte teal tint
      const mat = new THREE.MeshStandardMaterial({
        color: 0xdfeee8,
        metalness: 1.0,
        roughness: 0.22,
        emissive: 0x0a2418,
        emissiveIntensity: 0.4,
      });

      const keyGroup = new THREE.Group();

      // Kop (ring)
      const head = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.34, 24, 48), mat);
      head.position.set(0, 1.7, 0);
      keyGroup.add(head);

      // Schacht
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 3.4, 24), mat);
      shaft.position.set(0, -0.55, 0);
      keyGroup.add(shaft);

      // Tanden onderaan
      const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.34, 0.5), mat);
      tooth1.position.set(0.42, -1.9, 0);
      keyGroup.add(tooth1);
      const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.5), mat);
      tooth2.position.set(0.32, -2.5, 0);
      keyGroup.add(tooth2);

      keyGroup.rotation.z = 0.35;
      scene.add(keyGroup);

      const clock = new THREE.Clock();
      let paused = false;
      const onVis = () => { paused = document.hidden; if (!paused) clock.getDelta(); };
      document.addEventListener('visibilitychange', onVis);

      function animate() {
        if (destroyed) return;
        animId = requestAnimationFrame(animate);
        if (paused) return;
        const t = clock.getElapsedTime();
        keyGroup.rotation.y = t * 0.9;
        keyGroup.position.y = Math.sin(t * 1.2) * 0.08;
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
        document.removeEventListener('visibilitychange', onVis);
        ro.disconnect();
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });
    return () => { destroyed = true; cleanup?.(); };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}
