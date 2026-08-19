"use client";

/* eslint-disable react-hooks/immutability -- Three.js scene objects use an imperative mutable API by design. */

import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_CAMERA = [7, 5, 8];
export const DEFAULT_STARTER_CUBE_TRANSFORM = {
  position: { x: 0, y: 1, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const normalizeTransform = (transform = DEFAULT_STARTER_CUBE_TRANSFORM) => ({
  position: {
    ...DEFAULT_STARTER_CUBE_TRANSFORM.position,
    ...transform?.position,
  },
  rotation: {
    ...DEFAULT_STARTER_CUBE_TRANSFORM.rotation,
    ...transform?.rotation,
  },
  scale: {
    ...DEFAULT_STARTER_CUBE_TRANSFORM.scale,
    ...transform?.scale,
  },
});

const round = (value) => Math.round(value * 100) / 100;
const radiansToDegrees = (value) => round((value * 180) / Math.PI);
const degreesToRadians = (value) => (value * Math.PI) / 180;

const createControlValues = (transform) => {
  const normalized = normalizeTransform(transform);

  return {
    position: {
      ...normalized.position,
    },
    rotation: {
      x: radiansToDegrees(normalized.rotation.x),
      y: radiansToDegrees(normalized.rotation.y),
      z: radiansToDegrees(normalized.rotation.z),
    },
    scale: {
      ...normalized.scale,
    },
  };
};

export default function ThreeWorkspace({
  transform3D = DEFAULT_STARTER_CUBE_TRANSFORM,
  onTransformChange,
}) {
  const mountRef = useRef(null);
  const sceneApiRef = useRef(null);
  const onTransformChangeRef = useRef(onTransformChange);
  const documentTransformRef = useRef(normalizeTransform(transform3D));
  const [selected, setSelected] = useState(false);
  const [transformMode, setTransformMode] = useState("translate");
  const [transform, setTransform] = useState(() =>
    createControlValues(transform3D),
  );

  useEffect(() => {
    onTransformChangeRef.current = onTransformChange;
  }, [onTransformChange]);

  const syncTransformFromObject = useCallback((object) => {
    if (!object) return;
    const nextDocumentTransform = {
      position: {
        x: round(object.position.x),
        y: round(object.position.y),
        z: round(object.position.z),
      },
      rotation: {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z,
      },
      scale: {
        x: round(object.scale.x),
        y: round(object.scale.y),
        z: round(object.scale.z),
      },
    };

    documentTransformRef.current = nextDocumentTransform;
    setTransform(createControlValues(nextDocumentTransform));
    onTransformChangeRef.current?.(nextDocumentTransform);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let frameId = 0;
    let resizeObserver;
    let renderer;
    let orbitControls;
    let transformControls;
    let scene;
    let cube;

    async function initialize() {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/addons/controls/OrbitControls.js"
      );
      const { TransformControls } = await import(
        "three/addons/controls/TransformControls.js"
      );

      if (disposed) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x070a12);
      scene.fog = new THREE.Fog(0x070a12, 20, 42);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(...INITIAL_CAMERA);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.className = "block h-full w-full";
      mount.appendChild(renderer.domElement);

      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.075;
      orbitControls.target.set(0, 1, 0);
      orbitControls.minDistance = 2.5;
      orbitControls.maxDistance = 40;
      orbitControls.maxPolarAngle = Math.PI * 0.495;
      orbitControls.update();

      scene.add(new THREE.HemisphereLight(0xb9c9ff, 0x18101f, 1.7));

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

      cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({
          color: 0x6d28d9,
          emissive: 0x210b42,
          emissiveIntensity: 0.35,
          metalness: 0.48,
          roughness: 0.28,
        }),
      );
      cube.name = "Starter Cube";
      const initialTransform = documentTransformRef.current;
      cube.position.set(
        initialTransform.position.x,
        initialTransform.position.y,
        initialTransform.position.z,
      );
      cube.rotation.set(
        initialTransform.rotation.x,
        initialTransform.rotation.y,
        initialTransform.rotation.z,
      );
      cube.scale.set(
        initialTransform.scale.x,
        initialTransform.scale.y,
        initialTransform.scale.z,
      );
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(cube.geometry),
        new THREE.LineBasicMaterial({ color: 0xd8c7ff }),
      );
      cube.add(edges);

      transformControls = new TransformControls(camera, renderer.domElement);
      transformControls.setMode("translate");
      transformControls.setSize(0.8);
      scene.add(transformControls.getHelper());

      transformControls.addEventListener("dragging-changed", (event) => {
        orbitControls.enabled = !event.value;
      });
      transformControls.addEventListener("objectChange", () => {
        syncTransformFromObject(cube);
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const handleSelection = (event) => {
        if (transformControls.dragging) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hitCube = raycaster.intersectObject(cube, true).length > 0;
        if (hitCube) {
          transformControls.attach(cube);
          setSelected(true);
          syncTransformFromObject(cube);
        }
      };
      renderer.domElement.addEventListener("pointerdown", handleSelection);

      const resetView = () => {
        camera.position.set(...INITIAL_CAMERA);
        orbitControls.target.set(0, 1, 0);
        orbitControls.update();
      };

      const resetTransform = () => {
        const reset = DEFAULT_STARTER_CUBE_TRANSFORM;
        cube.position.set(
          reset.position.x,
          reset.position.y,
          reset.position.z,
        );
        cube.rotation.set(
          reset.rotation.x,
          reset.rotation.y,
          reset.rotation.z,
        );
        cube.scale.set(
          reset.scale.x,
          reset.scale.y,
          reset.scale.z,
        );
        syncTransformFromObject(cube);
      };

      sceneApiRef.current = {
        cube,
        transformControls,
        resetView,
        resetTransform,
        select: () => {
          transformControls.attach(cube);
          setSelected(true);
          syncTransformFromObject(cube);
        },
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
        orbitControls.update();
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(render);
      };
      render();

      sceneApiRef.current.cleanupSelection = () => {
        renderer.domElement.removeEventListener("pointerdown", handleSelection);
      };
    }

    initialize().catch((error) => {
      console.error("Unable to initialize the Design Lab 3D workspace", error);
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      sceneApiRef.current?.cleanupSelection?.();
      transformControls?.detach();
      transformControls?.dispose();
      orbitControls?.dispose();
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
      sceneApiRef.current = null;
    };
  }, [syncTransformFromObject]);

  useEffect(() => {
    const normalized = normalizeTransform(transform3D);
    documentTransformRef.current = normalized;
    // An opened or reset document is an external source of truth for these controls.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransform(createControlValues(normalized));

    const cube = sceneApiRef.current?.cube;
    if (!cube) return;

    cube.position.set(
      normalized.position.x,
      normalized.position.y,
      normalized.position.z,
    );
    cube.rotation.set(
      normalized.rotation.x,
      normalized.rotation.y,
      normalized.rotation.z,
    );
    cube.scale.set(
      normalized.scale.x,
      normalized.scale.y,
      normalized.scale.z,
    );
  }, [transform3D]);

  const changeMode = (mode) => {
    setTransformMode(mode);
    sceneApiRef.current?.transformControls?.setMode(mode);
    sceneApiRef.current?.select?.();
  };

  const updateTransformValue = (group, axis, rawValue) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;
    const cube = sceneApiRef.current?.cube;
    if (!cube) return;

    if (group === "position") cube.position[axis] = value;
    if (group === "rotation") cube.rotation[axis] = degreesToRadians(value);
    if (group === "scale") cube.scale[axis] = Math.max(value, 0.01);
    syncTransformFromObject(cube);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070A12] shadow-2xl shadow-black/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">3D Workspace</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Click the cube to select · Left drag: orbit · Wheel: zoom · Right drag: pan
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["translate", "Move"],
            ["rotate", "Rotate"],
            ["scale", "Scale"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => changeMode(mode)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                transformMode === mode
                  ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/20 text-[#DDD6FE]"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => sceneApiRef.current?.resetView?.()}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.07]"
          >
            Reset View
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
        <div ref={mountRef} className="h-[620px] min-h-[420px] w-full" />

        <aside className="border-t border-white/10 bg-[#0A0D15] p-4 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Starter Cube</p>
              <p className={`mt-1 text-xs ${selected ? "text-[#C4B5FD]" : "text-slate-500"}`}>
                {selected ? "Selected" : "Click cube to select"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => sceneApiRef.current?.resetTransform?.()}
              className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-2 text-[11px] font-semibold text-[#E7CA67]"
            >
              Reset
            </button>
          </div>

          {[
            ["position", "Position", "units"],
            ["rotation", "Rotation", "degrees"],
            ["scale", "Scale", "factor"],
          ].map(([group, label, suffix]) => (
            <fieldset key={group} className="mb-5">
              <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label} · {suffix}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {["x", "y", "z"].map((axis) => (
                  <label key={axis} className="block">
                    <span className={`mb-1 block text-[10px] font-bold uppercase ${
                      axis === "x" ? "text-red-400" : axis === "y" ? "text-green-400" : "text-blue-400"
                    }`}>
                      {axis}
                    </span>
                    <input
                      type="number"
                      step={group === "rotation" ? 1 : 0.1}
                      min={group === "scale" ? 0.01 : undefined}
                      value={transform[group][axis]}
                      onChange={(event) => updateTransformValue(group, axis, event.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-xs text-white outline-none focus:border-[#8B5CF6]/60"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <p className="rounded-xl border border-white/5 bg-white/[0.025] p-3 text-xs leading-5 text-slate-500">
            Drag the colored handles or enter exact values. Camera movement pauses automatically while transforming.
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-5 py-3 text-xs text-slate-500">
        <span>Perspective camera</span>
        <span>Transform gizmos</span>
        <span>Numeric controls</span>
        <span>Starter cube</span>
      </div>
    </section>
  );
}
