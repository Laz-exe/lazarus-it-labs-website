"use client";

import { useEffect, useRef, useState } from "react";
import { Expand, Focus, PanelRight, Scan, Shrink } from "lucide-react";

const PRESETS = {
  standard: { label: "Standard", height: 700, sidebarWidth: 470 },
  wide: { label: "Wide Canvas", height: 760, sidebarWidth: 360 },
  inspector: { label: "Inspector", height: 700, sidebarWidth: 570 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function WorkspaceLayoutShell({ mode, zoom = 100, onFitAll, onFitSelection, renderWorkspace, sidebar }) {
  const shellRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const [layout, setLayout] = useState(PRESETS.standard);
  const [preset, setPreset] = useState("standard");
  const [focusMode, setFocusMode] = useState(false);
  const [hydratedMode, setHydratedMode] = useState(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = window.localStorage.getItem(`lazarus-design-lab-layout-${mode}`);
      if (stored) {
        try {
          const value = JSON.parse(stored);
          setLayout({
            height: clamp(Number(value.height) || PRESETS.standard.height, 420, 1400),
            sidebarWidth: clamp(Number(value.sidebarWidth) || PRESETS.standard.sidebarWidth, 300, 720),
          });
          setPreset(value.preset ?? "custom");
        } catch {
          setLayout(PRESETS.standard);
          setPreset("standard");
        }
      } else {
        setLayout(PRESETS.standard);
        setPreset("standard");
      }
      setFocusMode(false);
      setHydratedMode(mode);
    });
    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    if (hydratedMode !== mode) return;
    window.localStorage.setItem(`lazarus-design-lab-layout-${mode}`, JSON.stringify({ ...layout, preset }));
  }, [hydratedMode, layout, mode, preset]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  const beginDrag = (kind, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = layout;
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = kind === "width" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    const move = (moveEvent) => {
      if (kind === "width") {
        setLayout((current) => ({ ...current, sidebarWidth: clamp(start.sidebarWidth - (moveEvent.clientX - startX), 300, 720) }));
      } else {
        setLayout((current) => ({ ...current, height: clamp(start.height + (moveEvent.clientY - startY), 420, 1400) }));
      }
      setPreset("custom");
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
      dragCleanupRef.current = null;
    };
    dragCleanupRef.current?.();
    dragCleanupRef.current = finish;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  const applyPreset = (id) => {
    setLayout(PRESETS[id]);
    setPreset(id);
  };
  const resetDivider = () => {
    setLayout((current) => ({ ...current, sidebarWidth: PRESETS.standard.sidebarWidth }));
    setPreset("custom");
  };
  const sidebarHidden = focusMode || !sidebar;

  return (
    <section ref={shellRef} className={focusMode ? "fixed inset-3 z-[1000] flex flex-col overflow-hidden rounded-[28px] border border-violet-400/30 bg-[#05070d] p-3 shadow-2xl shadow-black" : ""}>
      <div onDoubleClick={() => setFocusMode((value) => !value)} className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#10131c] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Layout</span>
          {Object.entries(PRESETS).map(([id, value]) => (
            <button key={id} type="button" onClick={() => applyPreset(id)} className={`rounded-lg border px-2.5 py-1.5 text-xs ${preset === id ? "border-violet-400/60 bg-violet-500/20 text-violet-100" : "border-white/10 text-slate-400 hover:text-white"}`}>{value.label}</button>
          ))}
          <button type="button" onClick={() => setFocusMode((value) => !value)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${focusMode ? "border-amber-400/50 bg-amber-400/10 text-amber-200" : "border-white/10 text-slate-300"}`}>
            {focusMode ? <Shrink className="h-3.5 w-3.5" /> : <Expand className="h-3.5 w-3.5" />}{focusMode ? "Exit Focus" : "Focus"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sidebarHidden && <span className="flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200"><PanelRight className="h-3 w-3" />Panels hidden</span>}
          <span className="min-w-14 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-center text-xs font-semibold text-slate-300">{Math.round(zoom)}%</span>
          <button type="button" onClick={onFitAll} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"><Scan className="h-3.5 w-3.5" />Fit All</button>
          <button type="button" onClick={onFitSelection} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"><Focus className="h-3.5 w-3.5" />Fit Selection</button>
        </div>
      </div>

      <div className="workspace-layout-grid min-h-0 flex-1" style={{ gridTemplateColumns: sidebarHidden ? "minmax(0,1fr)" : `minmax(0,1fr) 10px ${layout.sidebarWidth}px` }}>
        <div className="relative min-w-0 overflow-hidden" style={{ height: focusMode ? "calc(100vh - 104px)" : `${layout.height}px` }}>
          {renderWorkspace({ height: focusMode ? "100%" : layout.height, focusMode })}
          {!focusMode && <button type="button" aria-label="Resize workspace height" title="Drag to resize workspace height" onPointerDown={(event) => beginDrag("height", event)} className="group absolute inset-x-0 bottom-0 z-40 flex h-3 cursor-row-resize items-end justify-center border-t border-transparent hover:border-violet-400/60 hover:bg-violet-400/10"><span className="mb-1 h-0.5 w-12 rounded-full bg-white/15 group-hover:bg-violet-300/70" /></button>}
        </div>
        {!sidebarHidden && <button type="button" aria-label="Resize inspector width" title="Drag to resize · Double-click to reset" onPointerDown={(event) => beginDrag("width", event)} onDoubleClick={resetDivider} className="workspace-divider cursor-col-resize rounded-full bg-white/[0.04] hover:bg-violet-400/25" />}
        {!sidebarHidden && <div className="workspace-sidebar min-w-0 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: `${layout.height}px` }}>{sidebar}</div>}
      </div>
      <style jsx>{`
        .workspace-layout-grid { display: grid; gap: 0; }
        @media (max-width: 1100px) {
          .workspace-layout-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 1rem; }
          .workspace-divider { display: none; }
          .workspace-sidebar { max-height: none !important; }
        }
      `}</style>
    </section>
  );
}
