"use client";

import { useEffect, useRef } from "react";

const INITIAL_CAMERA = [7, 5, 8];

export default function ThreeWorkspace() {
  const mountRef = useRef(null);
  const resetViewRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let frameId = 0;
    let resizeObserver;
    let renderer;
    let controls;
    let scene;

    async function initialize() {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/addons/controls/OrbitControls.js"
      );

      if (disposed) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x070a12);
      scene.fog = new THREE.Fog(0x070a12, 20, 42);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(...INITIAL_CAMERA);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.className = "block h-full w-full";
      mount.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.target.set(0, 1, 0);
      controls.minDistance = 2.5;
      controls.maxDistance = 40;
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.update();

      const hemisphere = new THREE.HemisphereLight(0xb9c9ff, 0x18101f, 1.7);
      scene.add(hemisphere);

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(5, 9, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      scene.add(keyLight);

      const purpleLight = new THREE.PointLight(0x8b5cf6, 18, 18, 2);
      purpleLight.position.set(-4, 4, 2);
      scene.add(purpleLight);

      const goldLight = new THREE.PointLight(0xd4af37, 12, 16, 2);
      goldLight.position.set(4, 2.5, -3);
      scene.add(goldLight);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({
          color: 0x0b0e17,
          roughness: 0.92,
          metalness: 0.08,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const grid = new THREE.GridHelper(40, 40, 0xd4af37, 0x372454);
      grid.position.y = 0.002;
      grid.material.opacity = 0.42;
      grid.material.transparent = true;
      scene.add(grid);

      const axes = new THREE.AxesHelper(2.4);
      axes.position.set(-4.5, 0.02, 4.5);
      scene.add(axes);

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({
          color: 0x6d28d9,
          emissive: 0x210b42,
          emissiveIntensity: 0.35,
          metalness: 0.48,
          roughness: 0.28,
        }),
      );
      cube.position.y = 1;
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(cube.geometry),
        new THREE.LineBasicMaterial({ color: 0xd8c7ff }),
      );
      cube.add(edges);

      resetViewRef.current = () => {
        camera.position.set(...INITIAL_CAMERA);
        controls.target.set(0, 1, 0);
        controls.update();
      };

      const resize = () => {
        const width = Math.max(mount.clientWidth, 1);
        const height = Math.max(mount.clientHeight, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      const render = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(render);
      };
      render();
    }

    initialize().catch((error) => {
      console.error("Unable to initialize the Design Lab 3D workspace", error);
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      controls?.dispose();
      scene?.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
      renderer?.dispose();
      renderer?.domElement?.remove();
      resetViewRef.current = null;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070A12] shadow-2xl shadow-black/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">3D Workspace</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Left drag: orbit · Wheel: zoom · Right drag: pan
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetViewRef.current?.()}
          className="rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-3 py-2 text-xs font-semibold text-[#C4B5FD] transition hover:bg-[#8B5CF6]/20"
        >
          Reset View
        </button>
      </div>
      <div ref={mountRef} className="h-[620px] min-h-[420px] w-full" />
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 text-xs text-slate-500">
        <span>Perspective camera</span>
        <span>World grid</span>
        <span>X/Y/Z axes</span>
        <span>Starter cube</span>
      </div>
    </section>
  );
}
