"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, GripVertical, Lock, Trash2, Unlock } from "lucide-react";

const AXES = ["x", "y", "z"];
const GROUPS = { position: "Position · Units", rotation: "Rotation · Degrees", scale: "Scale · Factor" };
const DEFAULT_TRANSFORM = {
  position: { x: 0, y: 1, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};
const DEFAULT_MATERIAL = { type: "standard", metalness: 0.48, roughness: 0.28, opacity: 1, shininess: 60 };

const clone = (value) => JSON.parse(JSON.stringify(value));
const makeId = () => `3d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const degrees = (value) => Math.round(((value ?? 0) * 180 / Math.PI) * 100) / 100;
const radians = (value) => value * Math.PI / 180;
const normalize = (value = {}) => ({
  position: { ...DEFAULT_TRANSFORM.position, ...value.position },
  rotation: { ...DEFAULT_TRANSFORM.rotation, ...value.rotation },
  scale: { ...DEFAULT_TRANSFORM.scale, ...value.scale },
});

function useThreeScene(scene3D, onSceneChange) {
  const orderedIds = useMemo(() => {
    const objects = scene3D?.objects ?? {};
    const order = scene3D?.layerOrder ?? [];
    return [...order.filter((id) => objects[id]), ...Object.keys(objects).filter((id) => !order.includes(id))];
  }, [scene3D]);
  const selectedId = scene3D?.selectedObjectId ?? null;
  const selected = selectedId ? scene3D?.objects?.[selectedId] : null;
  const commit = (recipe) => {
    const next = clone(scene3D ?? { objects: {}, layerOrder: [] });
    recipe(next);
    onSceneChange(next);
  };
  const patch = (id, values) => commit((draft) => {
    if (draft.objects?.[id]) Object.assign(draft.objects[id], values);
  });
  return { orderedIds, selectedId, selected, commit, patch };
}

export function ThreeObjectsPositions({ scene3D, onSceneChange }) {
  const { orderedIds, selectedId, commit, patch } = useThreeScene(scene3D, onSceneChange);
  const [draggedId, setDraggedId] = useState(null);
  const move = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    commit((draft) => {
      const order = draft.layerOrder.filter((id) => id !== draggedId);
      order.splice(order.indexOf(targetId), 0, draggedId);
      draft.layerOrder = order;
    });
  };
  return (
    <div>
      <p className="mb-3 text-xs leading-5 text-slate-500">Select, reorder, show, hide, lock, or unlock 3D objects. Position order is top to bottom.</p>
      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {orderedIds.map((id, index) => {
          const object = scene3D.objects[id];
          return (
            <div key={id} draggable onDragStart={() => setDraggedId(id)} onDragEnd={() => setDraggedId(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => move(id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${selectedId === id ? "border-amber-400/50 bg-amber-400/10" : "border-white/5 bg-black/10"}`}>
              <GripVertical className="h-4 w-4 cursor-grab text-slate-600" />
              <button type="button" onClick={() => commit((draft) => { draft.selectedObjectId = id; })} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm text-slate-200">{object.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-600">Position {index + 1} · {object.type}</span>
              </button>
              <button type="button" title={object.visible === false ? "Show object" : "Hide object"} onClick={() => patch(id, { visible: object.visible === false })} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">{object.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              <button type="button" title={object.locked ? "Unlock object" : "Lock object"} onClick={() => patch(id, { locked: !object.locked })} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">{object.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ThreeInspector({ scene3D, onSceneChange, transformMode, onTransformModeChange }) {
  const { selectedId, selected, commit, patch } = useThreeScene(scene3D, onSceneChange);
  const [links, setLinks] = useState({ position: [], rotation: [], scale: [] });
  if (!selected) return <p className="text-sm leading-6 text-slate-500">Select a 3D object from the workspace or Objects / Positions panel.</p>;
  const transform = normalize(selected.transform3D);
  const displayValue = (group, axis) => group === "rotation" ? degrees(transform[group][axis]) : transform[group][axis];
  const updateTransform = (group, axis, raw) => {
    if (selected.locked) return;
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const next = normalize(selected.transform3D);
    next[group][axis] = group === "rotation" ? radians(value) : Math.max(group === "scale" ? value : -Infinity, group === "scale" ? 0.01 : -Infinity);
    links[group].filter((pair) => pair.includes(axis)).flat().filter((item) => item !== axis).forEach((linkedAxis) => { next[group][linkedAxis] = next[group][axis]; });
    patch(selected.id, { transform3D: next });
  };
  const duplicate = () => {
    const id = makeId();
    commit((draft) => {
      const copy = clone(selected);
      copy.id = id;
      copy.name = `${selected.name} Copy`;
      copy.transform3D = normalize(copy.transform3D);
      copy.transform3D.position.x += 0.5;
      copy.transform3D.position.z += 0.5;
      draft.objects[id] = copy;
      draft.layerOrder.push(id);
      draft.selectedObjectId = id;
    });
  };
  const remove = () => commit((draft) => {
    delete draft.objects[selectedId];
    draft.layerOrder = draft.layerOrder.filter((id) => id !== selectedId);
    draft.selectedObjectId = draft.layerOrder.at(-1) ?? null;
  });
  const material = { ...DEFAULT_MATERIAL, ...selected.material };
  return (
    <div className="space-y-5">
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Object name</label>
        <input value={selected.name} disabled={selected.locked} onChange={(event) => patch(selected.id, { name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white disabled:opacity-50" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["translate", "Move"], ["rotate", "Rotate"], ["scale", "Scale"]].map(([value, label]) => <button key={value} type="button" onClick={() => onTransformModeChange(value)} className={`rounded-xl border px-3 py-2 text-xs ${transformMode === value ? "border-violet-400/60 bg-violet-500/20 text-violet-100" : "border-white/10 text-slate-400"}`}>{label}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={duplicate} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300"><Copy className="h-4 w-4" />Copy</button>
        <button type="button" onClick={remove} className="flex items-center justify-center gap-2 rounded-xl border border-red-400/25 px-3 py-2 text-xs text-red-300"><Trash2 className="h-4 w-4" />Delete</button>
      </div>
      {Object.entries(GROUPS).map(([group, label]) => (
        <div key={group} className="border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p><div className="flex gap-1">{[["x", "y"], ["x", "z"], ["y", "z"]].map(([a, b]) => { const active = links[group].some((pair) => pair[0] === a && pair[1] === b); return <button key={`${a}${b}`} type="button" onClick={() => setLinks((current) => ({ ...current, [group]: active ? current[group].filter((pair) => pair[0] !== a || pair[1] !== b) : [...current[group], [a, b]] }))} className={`rounded border px-1.5 py-0.5 text-[9px] ${active ? "border-amber-400/60 bg-amber-400/15 text-amber-300" : "border-white/10 text-slate-500"}`}>{a.toUpperCase()}↔{b.toUpperCase()}</button>; })}</div></div>
          <div className="mt-2 grid grid-cols-3 gap-2">{AXES.map((axis) => <label key={axis} className="text-[10px] font-semibold uppercase text-slate-500">{axis}<input type="number" step="0.01" disabled={selected.locked} value={displayValue(group, axis)} onChange={(event) => updateTransform(group, axis, event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs font-normal text-white disabled:opacity-50" /></label>)}</div>
        </div>
      ))}
      <button type="button" disabled={selected.locked} onClick={() => patch(selected.id, { transform3D: clone(DEFAULT_TRANSFORM) })} className="w-full rounded-xl border border-amber-400/25 px-3 py-2 text-xs text-amber-300 disabled:opacity-50">Reset Transform</button>
      <section className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Add Colors</p>
        <div className="mt-3 flex items-center gap-3"><input type="color" value={selected.color ?? "#6d28d9"} disabled={selected.locked} onChange={(event) => patch(selected.id, { color: event.target.value })} className="h-11 w-16 rounded-lg border border-white/10 bg-black/20 p-1" /><input value={selected.color ?? "#6d28d9"} disabled={selected.locked} onChange={(event) => /^#[0-9a-f]{6}$/i.test(event.target.value) && patch(selected.id, { color: event.target.value })} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" /></div>
      </section>
      <section className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Add Material</p>
        <label className="mt-3 block text-[10px] uppercase tracking-wider text-slate-500">Surface<select value={material.type} disabled={selected.locked} onChange={(event) => patch(selected.id, { material: { ...material, type: event.target.value } })} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e16] px-3 py-2 text-sm text-white"><option value="standard">Standard PBR</option><option value="phong">Glossy Phong</option><option value="basic">Unlit Basic</option></select></label>
        {material.type === "standard" && <div className="mt-3 grid grid-cols-2 gap-3">{[["metalness", "Metalness"], ["roughness", "Roughness"]].map(([key, label]) => <label key={key} className="text-[10px] uppercase tracking-wider text-slate-500">{label}<input type="range" min="0" max="1" step="0.01" value={material[key]} disabled={selected.locked} onChange={(event) => patch(selected.id, { material: { ...material, [key]: Number(event.target.value) } })} className="mt-2 w-full" /></label>)}</div>}
        {material.type === "phong" && <label className="mt-3 block text-[10px] uppercase tracking-wider text-slate-500">Shininess<input type="range" min="0" max="100" step="1" value={material.shininess} disabled={selected.locked} onChange={(event) => patch(selected.id, { material: { ...material, shininess: Number(event.target.value) } })} className="mt-2 w-full" /></label>}
        <label className="mt-3 block text-[10px] uppercase tracking-wider text-slate-500">Opacity<input type="range" min="0.05" max="1" step="0.01" value={material.opacity} disabled={selected.locked} onChange={(event) => patch(selected.id, { material: { ...material, opacity: Number(event.target.value) } })} className="mt-2 w-full" /></label>
      </section>
    </div>
  );
}
