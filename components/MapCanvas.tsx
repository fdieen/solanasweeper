'use client';

import { useEffect, useRef } from 'react';
import type * as THREE_TYPE from 'three';

/**
 * MapCanvas — 3D cartoon-kaart met zwevende pin (toon-shaded).
 * Op hover tekent zich een nieuwe route over de kaart.
 */
export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;
    let animId: number;

    async function init() {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
      if (destroyed || !canvas) return;

      const W = canvas.offsetWidth || 300;
      const H = canvas.offsetHeight || 260;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
      camera.position.set(0, 6.6, 8.4);
      camera.lookAt(0, 0.4, 0);

      // Toon-gradient voor cel-shading
      const grad = new Uint8Array([60, 130, 200, 255]);
      const toonMap = new THREE.DataTexture(grad, grad.length / 4, 1, THREE.RGBAFormat);
      toonMap.needsUpdate = true;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const sun = new THREE.DirectionalLight(0xffffff, 2.2);
      sun.position.set(4, 8, 5);
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0x9945ff, 0.5);
      fill.position.set(-5, 2, -3);
      scene.add(fill);

      const map = new THREE.Group();
      map.rotation.x = -0.32;
      scene.add(map);

      const toon = (color: number) => new THREE.MeshToonMaterial({ color });

      // Water-plaat
      const plate = new THREE.Mesh(new RoundedBoxGeometry(5.2, 0.6, 3.6, 4, 0.28), toon(0x3aa0d8));
      map.add(plate);
      // Rand (witte kaartrand)
      const edge = new THREE.Mesh(new RoundedBoxGeometry(5.5, 0.5, 3.9, 4, 0.28), toon(0xeef3f7));
      edge.position.y = -0.08;
      map.add(edge);

      // Land-eilanden (cartoon continenten)
      const landMat = toon(0x52c98a);
      const land: Array<[number, number, number, number, number]> = [
        // x, z, w, d, rot
        [-1.4, -0.5, 1.7, 1.3, 0.3],
        [-1.0, 0.8, 1.1, 0.9, -0.4],
        [1.3, -0.4, 1.9, 1.4, -0.2],
        [1.0, 0.9, 0.8, 0.7, 0.5],
        [0.1, 0.2, 0.7, 0.6, 0.1],
      ];
      land.forEach(([x, z, w, d, rot]) => {
        const m = new THREE.Mesh(new RoundedBoxGeometry(w, 0.34, d, 4, 0.16), landMat);
        m.position.set(x, 0.34, z);
        m.rotation.y = rot;
        map.add(m);
      });

      // Route (tekent zichzelf bij hover)
      const routes: THREE_TYPE.Vector3[][] = [
        [new THREE.Vector3(-1.8, 0.56, 0.9), new THREE.Vector3(-0.6, 0.56, 0.2), new THREE.Vector3(0.6, 0.56, 0.6), new THREE.Vector3(1.6, 0.56, -0.5)],
        [new THREE.Vector3(-1.5, 0.56, -0.8), new THREE.Vector3(-0.2, 0.56, -0.2), new THREE.Vector3(0.9, 0.56, -0.7), new THREE.Vector3(1.7, 0.56, 0.6)],
        [new THREE.Vector3(-1.2, 0.56, 1.0), new THREE.Vector3(0.0, 0.56, 0.4), new THREE.Vector3(0.4, 0.56, -0.6), new THREE.Vector3(1.5, 0.56, 0.2)],
      ];
      let routeIdx = 0;
      let routeMesh: THREE_TYPE.Mesh | null = null;
      const routeMat = new THREE.MeshBasicMaterial({ color: 0x14f195 });
      const startDot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: 0x14f195 }));
      map.add(startDot);
      const endDot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshBasicMaterial({ color: 0x9945ff }));
      map.add(endDot);

      let drawProgress = 0;
      let curveRef: THREE_TYPE.CatmullRomCurve3 | null = null;

      function buildRoute(idx: number) {
        if (routeMesh) { map.remove(routeMesh); routeMesh.geometry.dispose(); }
        const curve = new THREE.CatmullRomCurve3(routes[idx]);
        curveRef = curve;
        const geo = new THREE.TubeGeometry(curve, 80, 0.05, 8, false);
        routeMesh = new THREE.Mesh(geo, routeMat);
        map.add(routeMesh);
        startDot.position.copy(routes[idx][0]);
        endDot.position.copy(routes[idx][routes[idx].length - 1]);
        drawProgress = 0;
      }
      buildRoute(0);

      // Pin: ring-kop met gat + punt eronder (klassieke map-pin)
      const pin = new THREE.Group();
      const pinMat = toon(0x9945ff);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.2, 20, 36), pinMat);
      ring.position.y = 0.62;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.05, 28), pinMat);
      tip.position.y = -0.1;
      tip.rotation.x = Math.PI;
      // Donker gat in het midden van de ring (richting camera)
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.26, 28), new THREE.MeshBasicMaterial({ color: 0x140a26 }));
      hole.position.set(0, 0.62, 0.02);
      pin.add(tip, ring, hole);
      pin.scale.setScalar(0.85);
      pin.position.set(1.6, 1.5, -0.5);
      map.add(pin);

      const clock = new THREE.Clock();
      let paused = false;
      const onVis = () => { paused = document.hidden; if (!paused) clock.getDelta(); };
      document.addEventListener('visibilitychange', onVis);

      const onEnter = () => { routeIdx = (routeIdx + 1) % routes.length; buildRoute(routeIdx); };
      canvas.addEventListener('pointerenter', onEnter);

      function animate() {
        if (destroyed) return;
        animId = requestAnimationFrame(animate);
        if (paused) return;
        const t = clock.getElapsedTime();

        // Zachte wieg
        map.rotation.y = Math.sin(t * 0.4) * 0.18;

        // Pin zweeft boven het eindpunt
        if (curveRef) {
          const end = routes[routeIdx][routes[routeIdx].length - 1];
          pin.position.x += (end.x - pin.position.x) * 0.08;
          pin.position.z += (end.z - pin.position.z) * 0.08;
          pin.position.y = 1.5 + Math.sin(t * 1.6) * 0.15;
        }

        // Route tekenen
        if (routeMesh && drawProgress < 1) {
          drawProgress = Math.min(1, drawProgress + 0.02);
          const geo = routeMesh.geometry as THREE_TYPE.TubeGeometry;
          const total = geo.index ? geo.index.count : 0;
          geo.setDrawRange(0, Math.floor(total * drawProgress));
        }

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
        canvas.removeEventListener('pointerenter', onEnter);
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
