export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-64">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/10 blur-[130px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Lazarus I.T. Labs LLC
          </p>

          <h1 className="text-6xl font-semibold leading-none tracking-tight md:text-8xl">
            Save Your Technology.
          </h1>

          <p className="mt-6 text-xl font-medium text-white">
            Give your technology a second chance.
          </p>

          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
            We help homeowners and small businesses restore, protect, and improve
            the technology they already depend on — without unnecessary replacements
            or complicated solutions.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#contact" className="rounded-xl bg-[#D4AF37] px-6 py-4 font-semibold text-black transition hover:scale-105">
              Get a Quote
            </a>

            <a href="#message" className="rounded-xl border border-[#D4AF37]/50 px-6 py-4 font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/10">
              Start the Conversation
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
            <span>✓ Honest Advice</span>
            <span>✓ Practical Solutions</span>
            <span>✓ Modern Expertise</span>
          </div>
        </div>

        <div id="message" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Private Client Inbox</p>
              <h2 className="text-2xl font-semibold">Start the Conversation</h2>
            </div>
            <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-sm text-[#D4AF37]">
              Private
            </span>
          </div>

          <div className="space-y-4">
            <input className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Name" />
            <input className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Email" />
            <textarea className="min-h-36 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Tell me what is going on..." />
            <button className="w-full rounded-xl bg-[#D4AF37] px-5 py-4 font-semibold text-black">
              Send Message
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Messages will be private and visible only to Lazarus I.T. Labs.
          </p>
        </div>
      </div>
    </section>
  );
}
