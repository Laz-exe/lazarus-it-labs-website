"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INITIAL_CAMERA = [7, 5, 8];
const TYPE_LABELS = {
  box: "Cube",
  sphere: "Sphere",
  cylinder: "Cylinder",
  cone: "Cone",
  plane: "Plane",
};
const DEFAULT_TRANSFORM = {
  position: { x: 0, y: 1, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const round = (value) => Math.round(value * 100) / 100;
const makeId = () =>
  `3d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeTransform = (transform = DEFAULT_TRANSFORM) => ({
  position: { ...DEFAULT_TRANSFORM.position, ...transform?.position },
  rotation: { ...DEFAULT_TRANSFORM.rotation, ...transform?.rotation },
  scale: { ...DEFAULT_TRANSFORM.scale, ...transform?.scale },
});

const geometryFor = (THREE, type) => {
  if (type === "sphere") return new THREE.SphereGeometry(1.15, 32, 20);
  if (type === "cylinder") return new THREE.CylinderGeometry(1, 1, 2, 32);
  if (type === "cone") return new THREE.ConeGeometry(1.1, 2.2, 32);
  if (type === "plane") return new THREE.PlaneGeometry(2.4, 2.4);
  return new THREE.BoxGeometry(2, 2, 2);
};

export default function ThreeWorkspace({ scene3D, onSceneChange, transformMode = "translate" }) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const sceneRef = useRef(scene3D);
  const onSceneChangeRef = useRef(onSceneChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sceneRef.current = scene3D;
  }, [scene3D]);
  useEffect(() => {
    onSceneChangeRef.current = onSceneChange;
  }, [onSceneChange]);

  const orderedIds = useMemo(() => {
    const ids = scene3D?.layerOrder ?? [];
    const objects = scene3D?.objects ?? {};
    return [...ids.filter((id) => objects[id]), ...Object.keys(objects).filter((id) => !ids.includes(id))];
  }, [scene3D]);
  const selectedId = scene3D?.selectedObjectId ?? null;
  const selected = selectedId ? scene3D?.objects?.[selectedId] : null;
  const commit = useCallback((recipe) => {
    const current = sceneRef.current ?? { objects: {}, layerOrder: [] };
    const next = clone(current);
    recipe(next);
    sceneRef.current = next;
    onSceneChangeRef.current?.(next);
  }, []);

  const selectObject = useCallback((id) => {
    commit((draft) => {
      draft.selectedObjectId = draft.objects?.[id] ? id : null;
    });
  }, [commit]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let disposed = false;
    let frameId = 0;
    let observer;
    let renderer;
    let orbit;
    let transform;
    let scene;

    async function initialize() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { TransformControls } = await import("three/addons/controls/TransformControls.js");
      if (disposed) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x070a12);
      scene.fog = new THREE.Fog(0x070a12, 20, 42);
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(...INITIAL_CAMERA);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.domElement.className = "block h-full w-full";
      mount.appendChild(renderer.domElement);

      orbit = new OrbitControls(camera, renderer.domElement);
      orbit.enableDamping = true;
      orbit.target.set(0, 1, 0);
      orbit.minDistance = 2.5;
      orbit.maxDistance = 40;
      orbit.maxPolarAngle = Math.PI * 0.495;

      scene.add(new THREE.HemisphereLight(0xb9c9ff, 0x18101f, 1.7));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(5, 9, 6);
      key.castShadow = true;
      scene.add(key);
      const purple = new THREE.PointLight(0x8b5cf6, 18, 18, 2);
      purple.position.set(-4, 4, 2);
      scene.add(purple);
      const gold = new THREE.PointLight(0xd4af37, 12, 16, 2);
      gold.position.set(4, 2.5, -3);
      scene.add(gold);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x0b0e17, roughness: 0.92, metalness: 0.08 }),
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

      transform = new TransformControls(camera, renderer.domElement);
      transform.setSize(0.8);
      scene.add(transform.getHelper());
      transform.addEventListener("dragging-changed", (event) => {
        orbit.enabled = !event.value;
      });
      transform.addEventListener("objectChange", () => {
        const object = transform.object;
        const id = object?.userData?.objectId;
        if (!id) return;
        const nextTransform = {
          position: { x: round(object.position.x), y: round(object.position.y), z: round(object.position.z) },
          rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
          scale: { x: round(object.scale.x), y: round(object.scale.y), z: round(object.scale.z) },
        };
        commit((draft) => {
          if (draft.objects?.[id]) draft.objects[id].transform3D = nextTransform;
        });
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const handleSelection = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const meshes = [...apiRef.current.meshes.values()].filter((mesh) => mesh.visible);
        const hit = raycaster.intersectObjects(meshes, false)[0]?.object;
        if (hit?.userData?.objectId) selectObject(hit.userData.objectId);
      };
      renderer.domElement.addEventListener("pointerdown", handleSelection);

      apiRef.current = {
        THREE,
        scene,
        camera,
        orbit,
        transform,
        meshes: new Map(),
        resetView() {
          camera.position.set(...INITIAL_CAMERA);
          orbit.target.set(0, 1, 0);
          orbit.update();
        },
        cleanup() {
          renderer.domElement.removeEventListener("pointerdown", handleSelection);
        },
      };
      setReady(true);

      const resize = () => {
        const width = Math.max(mount.clientWidth, 1);
        const height = Math.max(mount.clientHeight, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();
      const render = () => {
        if (disposed) return;
        orbit.update();
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(render);
      };
      render();
    }
    initialize().catch((error) => console.error("Unable to initialize the Design Lab 3D workspace", error));
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      apiRef.current?.cleanup?.();
      transform?.detach();
      transform?.dispose();
      orbit?.dispose();
      scene?.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
        else object.material?.dispose?.();
      });
      renderer?.dispose();
      renderer?.domElement?.remove();
      apiRef.current = null;
    };
  }, [commit, selectObject]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || !ready) return;
    const { THREE, scene, meshes, transform } = api;
    const objects = scene3D?.objects ?? {};
    for (const [id, mesh] of meshes) {
      if (!objects[id] || objects[id].type !== mesh.userData.type) {
        if (transform.object === mesh) transform.detach();
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        meshes.delete(id);
      }
    }
    orderedIds.forEach((id) => {
      const object = objects[id];
      if (!object) return;
      let mesh = meshes.get(id);
      if (!mesh) {
        mesh = new THREE.Mesh(
          geometryFor(THREE, object.type),
          new THREE.MeshStandardMaterial({ color: 0x6d28d9, emissive: 0x210b42, emissiveIntensity: 0.35, metalness: 0.48, roughness: 0.28, side: THREE.DoubleSide }),
        );
        mesh.userData = { objectId: id, type: object.type };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        meshes.set(id, mesh);
      }
      const materialType = object.material?.type ?? "standard";
      const expectedMaterial = materialType === "basic" ? "MeshBasicMaterial" : materialType === "phong" ? "MeshPhongMaterial" : "MeshStandardMaterial";
      if (mesh.material.type !== expectedMaterial) {
        mesh.material.dispose();
        const common = { color: object.color ?? "#6d28d9", side: THREE.DoubleSide, transparent: true };
        mesh.material = materialType === "basic"
          ? new THREE.MeshBasicMaterial(common)
          : materialType === "phong"
            ? new THREE.MeshPhongMaterial({ ...common, shininess: object.material?.shininess ?? 60 })
            : new THREE.MeshStandardMaterial(common);
      }
      mesh.material.color.set(object.color ?? "#6d28d9");
      mesh.material.opacity = object.material?.opacity ?? 1;
      if (mesh.material.isMeshStandardMaterial) {
        mesh.material.metalness = object.material?.metalness ?? 0.48;
        mesh.material.roughness = object.material?.roughness ?? 0.28;
      }
      if (mesh.material.isMeshPhongMaterial) mesh.material.shininess = object.material?.shininess ?? 60;
      const value = normalizeTransform(object.transform3D);
      mesh.name = object.name;
      mesh.visible = object.visible !== false;
      mesh.position.set(value.position.x, value.position.y, value.position.z);
      mesh.rotation.set(value.rotation.x, value.rotation.y, value.rotation.z);
      mesh.scale.set(value.scale.x, value.scale.y, value.scale.z);
    });
    const mesh = selectedId ? meshes.get(selectedId) : null;
    if (mesh && selected?.visible !== false && !selected?.locked) {
      transform.attach(mesh);
      transform.setMode(transformMode);
    } else transform.detach();
  }, [orderedIds, ready, scene3D, selected, selectedId, transformMode]);

  const addObject = (type) => {
    const id = makeId();
    commit((draft) => {
      draft.objects ??= {};
      draft.layerOrder ??= [];
      draft.objects[id] = {
        id,
        kind: "object",
        type,
        name: `${TYPE_LABELS[type]} ${draft.layerOrder.length + 1}`,
        visible: true,
        locked: false,
        color: "#6d28d9",
        material: { type: "standard", metalness: 0.48, roughness: 0.28, opacity: 1, shininess: 60 },
        transform3D: clone(DEFAULT_TRANSFORM),
      };
      draft.layerOrder.push(id);
      draft.selectedObjectId = id;
    });
  };

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0e16]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">3D Workspace</p>
          <p className="text-[11px] text-slate-500">Select an object · Left drag: orbit · Wheel: zoom · Right drag: pan</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <button key={type} type="button" onClick={() => addObject(type)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:border-violet-400/60">+ {label}</button>
          ))}
          <button type="button" onClick={() => apiRef.current?.resetView()} className="rounded-lg border border-violet-400/30 px-2.5 py-1.5 text-xs text-violet-200">Reset View</button>
        </div>
      </div>

      <div ref={mountRef} className="min-h-[620px]" />
    </section>
  );
}
