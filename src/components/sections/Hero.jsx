import Image from "next/image";
import { Gauge, Network, ShieldCheck } from "lucide-react";

const pillars = [
  {
    title: "Security",
    description: "Protected by design.",
    Icon: ShieldCheck,
    position: "left-1/2 top-[2%] -translate-x-1/2 text-center items-center",
    line: "M300 300 L300 92",
    dot: { cx: 300, cy: 185 },
  },
  {
    title: "Performance",
    description: "Faster. Longer. Better.",
    Icon: Gauge,
    position: "left-[4%] bottom-[10%] text-center items-center",
    line: "M300 300 L112 370",
    dot: { cx: 165, cy: 350 },
  },
  {
    title: "Connectivity",
    description: "Everything working together.",
    Icon: Network,
    position: "right-[2%] bottom-[10%] text-center items-center",
    line: "M300 300 L500 370",
    dot: { cx: 435, cy: 350 },
  },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-64">
      <div className="absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
      <div className="absolute bottom-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        <div>
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
              className="rounded-2xl bg-[#D4AF37] px-8 py-4 text-lg font-semibold text-black transition hover:scale-105 hover:shadow-lg hover:shadow-[#D4AF37]/30"
            >
              Get a Quote
            </a>

            <a
              href="#services"
              className="rounded-2xl border border-[#D4AF37]/50 px-8 py-4 text-lg font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
            >
              Explore Services
            </a>
          </div>

          <div className="mt-12 grid max-w-xl gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Honest Advice
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Practical Solutions
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Modern Expertise
            </div>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[680px]">
          <div className="absolute inset-0 rounded-[2.5rem] bg-transparent" />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 600 600"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="42%" stopColor="#D4AF37" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="lineGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.35" />
              </linearGradient>

              <filter id="softGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle cx="300" cy="300" r="235" fill="url(#coreGlow)" />

            {pillars.map((pillar) => (
              <path
                key={pillar.title}
                d={pillar.line}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="2 6"
                filter="url(#softGlow)"
                fill="none"
              />
            ))}

            {pillars.map((pillar) => (
              <circle
                key={`${pillar.title}-dot`}
                cx={pillar.dot.cx}
                cy={pillar.dot.cy}
                r="6"
                fill="#D4AF37"
                filter="url(#softGlow)"
              />
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 z-20 flex h-64 w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 p-8 shadow-2xl shadow-purple-500/30 backdrop-blur-xl">
            <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-3xl lazarus-breathe" />
            <Image
              src="/logo-primary.png"
              alt="Lazarus I.T. Labs"
              width={320}
              height={230}
              priority
              className="relative h-auto w-full"
            />
          </div>

          {pillars.map(({ title, description, Icon, position }) => (
            <div
              key={title}
              className={`absolute z-30 flex max-w-56 flex-col gap-3 ${position}`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white/[0.06] text-[#D4AF37] shadow-lg shadow-black/30 backdrop-blur-xl">
                <Icon className="h-9 w-9" strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-base leading-6 text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 left-1/2 h-24 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600/20 via-[#D4AF37]/25 to-blue-600/15 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
