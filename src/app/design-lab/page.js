"use client";

import Image from "next/image";
import { useState } from "react";
import { Gauge, Network, ShieldCheck } from "lucide-react";

const initialLayout = {
  core: { x: 50, y: 50 },
  performance: { x: 16.6, y: 50.3 },
  security: { x: 50.3, y: 21.4 },
  connectivity: { x: 82, y: 50.4 },
};

const nodes = [
  { id: "performance", title: "Performance", Icon: Gauge },
  { id: "security", title: "Security", Icon: ShieldCheck },
  { id: "connectivity", title: "Connectivity", Icon: Network },
];

export default function DesignLab() {
  const [layout, setLayout] = useState(initialLayout);
  const [dragging, setDragging] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showThirds, setShowThirds] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(true);

  function updatePosition(event) {
    if (!dragging) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setLayout((current) => ({
      ...current,
      [dragging]: {
        x: Number(Math.max(0, Math.min(100, x)).toFixed(1)),
        y: Number(Math.max(0, Math.min(100, y)).toFixed(1)),
      },
    }));
  }

  function copyLayout() {
    const output = JSON.stringify(layout, null, 2);
    navigator.clipboard.writeText(output);
    alert("Layout copied.");
  }

  return (
    <main className="min-h-screen bg-[#05070D] p-8 text-white">
      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Hero Design Lab</h1>
          <p className="mt-2 text-slate-400">
            Drag the emblem and nodes. Copy the final layout when it feels right.
          </p>
        </div>

        <button
          onClick={copyLayout}
          className="rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-black"
        >
          Copy Layout
        </button>
      </div>

      <div className="mx-auto mb-6 flex max-w-7xl flex-wrap gap-3">
        <Toggle label="Grid" value={showGrid} setValue={setShowGrid} />
        <Toggle label="Thirds" value={showThirds} setValue={setShowThirds} />
        <Toggle label="Crosshair" value={showCrosshair} setValue={setShowCrosshair} />
      </div>

      <div
        onMouseMove={updatePosition}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        className="relative mx-auto aspect-square max-w-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#05070D] via-[#111827] to-[#24103f]"
      >
        {showGrid && <Grid />}
        {showThirds && <Thirds />}
        {showCrosshair && <Crosshair />}

        <Connections layout={layout} />

        <div
          onMouseDown={() => setDragging("core")}
          className="absolute z-20 flex h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 cursor-move items-center justify-center"
          style={{ left: `${layout.core.x}%`, top: `${layout.core.y}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-purple-500/25 blur-[70px]" />
          <div className="absolute inset-6 rounded-full border border-[#D4AF37]/15 bg-black/10 backdrop-blur-md" />
          <div className="absolute inset-10 rounded-full border border-[#8B5CF6]/50" />

          <Image
            src="/logo-emblem.png"
            alt="Lazarus emblem"
            width={410}
            height={410}
            priority
            className="relative h-auto w-full"
          />
        </div>

        {nodes.map(({ id, title, Icon }) => (
          <div
            key={id}
            onMouseDown={() => setDragging(id)}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move text-center"
            style={{ left: `${layout[id].x}%`, top: `${layout[id].y}%` }}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white/[0.055] text-[#D4AF37] shadow-lg backdrop-blur-xl">
              <Icon className="h-7 w-7" strokeWidth={1.7} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        ))}
      </div>

      <pre className="mx-auto mt-6 max-w-7xl rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-slate-300">
        {JSON.stringify(layout, null, 2)}
      </pre>
    </main>
  );
}

function Toggle({ label, value, setValue }) {
  return (
    <button
      onClick={() => setValue(!value)}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
        value
          ? "border-[#D4AF37] bg-[#D4AF37] text-black"
          : "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function Connections({ layout }) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
      {nodes.map(({ id }) => (
        <line
          key={id}
          x1={`${layout.core.x}%`}
          y1={`${layout.core.y}%`}
          x2={`${layout[id].x}%`}
          y2={`${layout[id].y}%`}
          stroke="#8B5CF6"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeDasharray="4 8"
        />
      ))}
    </svg>
  );
}

function Grid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
        backgroundSize: "5% 5%",
      }}
    />
  );
}

function Thirds() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/3 top-0 h-full w-px bg-[#D4AF37]/40" />
      <div className="absolute left-2/3 top-0 h-full w-px bg-[#D4AF37]/40" />
      <div className="absolute left-0 top-1/3 h-px w-full bg-[#D4AF37]/40" />
      <div className="absolute left-0 top-2/3 h-px w-full bg-[#D4AF37]/40" />
    </div>
  );
}

function Crosshair() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-full w-px bg-purple-400/60" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-purple-400/60" />
    </div>
  );
}