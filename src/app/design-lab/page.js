"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Gauge, Network, ShieldCheck } from "lucide-react";

const heroNodes = [
  {
    id: "performance",
    title: "Performance",
    description: "Faster. Longer. Better.",
    Icon: Gauge,
  },
  {
    id: "security",
    title: "Security",
    description: "Protected by design.",
    Icon: ShieldCheck,
  },
  {
    id: "connectivity",
    title: "Connectivity",
    description: "Everything working together.",
    Icon: Network,
  },
];

const defaultLayout = {
  core: { x: 50, y: 50 },
  performance: { x: 16.6, y: 50.3 },
  security: { x: 50.3, y: 21.4 },
  connectivity: { x: 82, y: 50.4 },
};

export default function DesignLab() {
  const [layout, setLayout] = useState(defaultLayout);
  const [dragging, setDragging] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showThirds, setShowThirds] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);

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
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
    alert("Layout copied.");
  }

  function resetLayout() {
    setLayout(defaultLayout);
  }
    const layoutCode = useMemo(() => {
    return `export const heroLayout = ${JSON.stringify(layout, null, 2)};`;
  }, [layout]);

  return (
    <main className="min-h-screen bg-[#05070D] p-8 text-white">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Lazarus Design Lab
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Hero Layout Tool
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Drag the core and pillars until the hero composition feels right.
              Then copy the layout into production.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetLayout}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-200"
            >
              Reset
            </button>

            <button
              onClick={copyLayout}
              className="rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-black"
            >
              Copy Layout
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div
            onMouseMove={updatePosition}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
            className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#05070D] via-[#101827] to-[#261044] shadow-2xl shadow-black/50"
          >
            {showGrid && <Grid />}
            {showThirds && <Thirds />}
            {showCrosshair && <Crosshair />}
            {showSafeArea && <SafeArea />}

            <Connections layout={layout} />

            <HeroCore
              point={layout.core}
              onMouseDown={() => setDragging("core")}
            />

            {heroNodes.map((node) => (
              <HeroNode
                key={node.id}
                node={node}
                point={layout[node.id]}
                onMouseDown={() => setDragging(node.id)}
              />
            ))}
          </div>
                    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-xl font-semibold">Controls</h2>

            <div className="mt-5 grid gap-3">
              <Toggle label="Grid" value={showGrid} setValue={setShowGrid} />
              <Toggle label="Rule of Thirds" value={showThirds} setValue={setShowThirds} />
              <Toggle label="Crosshair" value={showCrosshair} setValue={setShowCrosshair} />
              <Toggle label="Safe Area" value={showSafeArea} setValue={setShowSafeArea} />
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-semibold text-slate-200">Coordinates</h3>

              <div className="space-y-3">
                <Coordinate label="Core" point={layout.core} />
                <Coordinate label="Performance" point={layout.performance} />
                <Coordinate label="Security" point={layout.security} />
                <Coordinate label="Connectivity" point={layout.connectivity} />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-semibold text-slate-200">Export</h3>

              <pre className="max-h-72 overflow-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-xs leading-5 text-slate-300">
                {layoutCode}
              </pre>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
function HeroCore({ point, onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute z-20 flex h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 cursor-move items-center justify-center"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
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
  );
}

function HeroNode({ node, point, onMouseDown }) {
  const Icon = node.Icon;

  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move text-center"
      style={{ left: `${point.x}%`, top: `${point.y}%` }}
    >
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white/[0.055] text-[#D4AF37] shadow-lg shadow-black/30 backdrop-blur-xl">
        <Icon className="h-7 w-7" strokeWidth={1.7} />
      </div>

      <h3 className="text-lg font-semibold text-white">{node.title}</h3>

      <p className="mt-2 max-w-[180px] text-sm leading-5 text-slate-400">
        {node.description}
      </p>
    </div>
  );
}

function Connections({ layout }) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
      {heroNodes.map((node) => (
        <line
          key={node.id}
          x1={`${layout.core.x}%`}
          y1={`${layout.core.y}%`}
          x2={`${layout[node.id].x}%`}
          y2={`${layout[node.id].y}%`}
          stroke="#8B5CF6"
          strokeOpacity="0.6"
          strokeWidth="2"
          strokeDasharray="4 8"
        />
      ))}
    </svg>
  );
}
function Toggle({ label, value, setValue }) {
  return (
    <button
      onClick={() => setValue(!value)}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        value
          ? "border-[#D4AF37] bg-[#D4AF37] text-black"
          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#D4AF37]/40"
      }`}
    >
      {label}
    </button>
  );
}

function Coordinate({ label, point }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="font-semibold text-white">{label}</p>
      <p className="mt-1 text-slate-400">
        X: {point.x.toFixed(1)}
      </p>
      <p className="text-slate-400">
        Y: {point.y.toFixed(1)}
      </p>
    </div>
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
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]" />
    </div>
  );
}

function SafeArea() {
  return (
    <div className="pointer-events-none absolute inset-8 rounded-[1.5rem] border border-dashed border-white/20" />
  );
}