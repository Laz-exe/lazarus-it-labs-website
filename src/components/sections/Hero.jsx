"use client";

import Image from "next/image";
import { Gauge, Network, ShieldCheck } from "lucide-react";

const pillars = [
  {
    title: "Performance",
    description: "Faster. Longer. Better.",
    Icon: Gauge,
    x: 7,
    y: 51,
    labelPosition: "below",
  },
  {
    title: "Security",
    description: "Protected by design.",
    Icon: ShieldCheck,
    x: 50,
    y: 8,
    labelPosition: "above",
  },
  {
    title: "Connectivity",
    description: "Everything working together.",
    Icon: Network,
    x: 93,
    y: 51,
    labelPosition: "below",
  },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32 md:pt-36">
      <div className="absolute right-[-4%] top-[-8%] h-[500px] w-[500px] rounded-full bg-purple-600/16 blur-[145px]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="relative z-10">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Lazarus I.T. Labs LLC
          </p>

          <h1 className="max-w-3xl text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
            Save Your Technology.
          </h1>

          <p className="mt-7 text-2xl font-medium text-[#8B5CF6]">
            Give your technology a second chance.
          </p>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            We restore, protect, and optimize the technology you already depend
            on — so everything works better, together.
          </p>

          <div className="mt-9 flex flex-wrap gap-5">
            <a
              href="#contact"
              className="rounded-2xl bg-[#D4AF37] px-8 py-4 text-lg font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4AF37]/30"
            >
              Get a Quote
            </a>

            <a
              href="#services"
              className="rounded-2xl border border-[#D4AF37]/50 px-8 py-4 text-lg font-semibold text-[#D4AF37] transition duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/10"
            >
              Explore Services
            </a>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[820px] translate-y-6">
          <svg
            className="absolute inset-0 z-10 h-full w-full"
            viewBox="0 0 600 600"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.72" />
                <stop offset="38%" stopColor="#8B5CF6" stopOpacity="0.2" />
                <stop offset="58%" stopColor="#D4AF37" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="300" cy="300" r="258" fill="url(#coreGlow)" />
          </svg>

          <div className="group absolute left-1/2 top-1/2 z-20 flex h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[510px] md:w-[510px]">
            <div className="absolute inset-0 rounded-full bg-purple-500/25 blur-[95px] transition duration-500 group-hover:bg-purple-500/30 lazarus-breathe" />

            <div className="absolute inset-8 rounded-full border border-white/[0.08] bg-white/[0.025] shadow-[0_0_110px_rgba(139,92,246,.2),inset_0_0_55px_rgba(255,255,255,.025)] backdrop-blur-xl transition duration-500 group-hover:border-[#8B5CF6]/30 group-hover:bg-white/[0.035] group-hover:shadow-[0_0_135px_rgba(139,92,246,.28),inset_0_0_70px_rgba(255,255,255,.035)]" />

            <div className="absolute inset-14 rounded-full border border-[#8B5CF6]/35 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-[#D4AF37]/[0.06] shadow-[inset_0_0_45px_rgba(139,92,246,.08)] transition duration-500 group-hover:border-[#8B5CF6]/50" />

            <Image
              src="/logo-emblem.png"
              alt="Lazarus I.T. Labs emblem"
              width={510}
              height={510}
              priority
              className="relative z-10 h-auto w-[88%] drop-shadow-[0_0_38px_rgba(255,255,255,.16)] transition duration-500 group-hover:drop-shadow-[0_0_48px_rgba(139,92,246,.28)]"
            />
          </div>

          {/* TOP CONNECTOR — LOCKED / REFERENCE */}
          <div className="pointer-events-none absolute left-1/2 top-[13%] z-[25] h-[12%] w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,.8)]" />

          {/*
            The top connector ends at 25% of the Core container:

              13% top + 12% height = 25%

            Since the emblem ring is circular and centered at 50%,
            the side connector inner endpoints also stop at 25% / 75%.

            Left:
              starts at 10.5%
              ends at 25%
              width = 14.5%

            Right:
              starts from 89.5%
              ends at 75%
              width = 14.5%

            This makes all three connector-to-ring gaps geometrically equal.
          */}

          {/* LEFT CONNECTOR */}
          <div className="pointer-events-none absolute left-[10.5%] top-[51%] z-[25] h-[3px] w-[14.5%] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,.8)]" />

          {/* RIGHT CONNECTOR */}
          <div className="pointer-events-none absolute right-[10.5%] top-[51%] z-[25] h-[3px] w-[14.5%] -translate-y-1/2 rounded-full bg-gradient-to-l from-[#D4AF37] to-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,.8)]" />

          {pillars.map(
            ({ title, description, Icon, x, y, labelPosition }) => (
              <div
                key={title}
                className="group absolute z-30 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-black/25 text-[#D4AF37] shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 group-hover:scale-110 group-hover:border-[#D4AF37]/65 group-hover:bg-[#D4AF37]/10">
                  <Icon className="h-7 w-7" strokeWidth={1.7} />
                </div>

                <div
                  className={`absolute left-1/2 w-[190px] -translate-x-1/2 text-center ${
                    labelPosition === "above"
                      ? "bottom-[calc(100%+12px)]"
                      : "top-[calc(100%+12px)]"
                  }`}
                >
                  <h3 className="text-base font-semibold text-white md:text-lg">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-slate-400 opacity-80 transition duration-300 group-hover:opacity-100">
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}