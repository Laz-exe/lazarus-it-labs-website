export default function Philosophy() {
  return (
    <section className="relative overflow-hidden bg-[#05070D] px-6 py-36 text-white">
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/5 blur-[150px]" />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
          Our Philosophy
        </p>

        <h2 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
          Get More From Your Technology.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
          We believe technology should be reliable, secure, and built to support
          the people who depend on it every day.
        </p>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400">
          Whether you're working from home, running a business, or planning for
          the future, our goal is simple:
        </p>

        <p className="mt-10 text-2xl font-semibold text-[#D4AF37]">
          Help you get more from the technology you already own.
        </p>
      </div>

      <div className="mx-auto mt-24 grid max-w-6xl gap-8 md:grid-cols-3">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h3 className="text-2xl font-semibold">
            Restore
          </h3>

          <p className="mt-5 leading-8 text-slate-400">
            Replace hardware only when it truly makes sense. Many problems can
            be solved through expertise, maintenance, and thoughtful upgrades.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h3 className="text-2xl font-semibold">
            Protect
          </h3>

          <p className="mt-5 leading-8 text-slate-400">
            Reliable systems begin with good security, dependable backups,
            and technology that you can trust every day.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h3 className="text-2xl font-semibold">
            Improve
          </h3>

          <p className="mt-5 leading-8 text-slate-400">
            Better performance, stronger networks, smarter planning, and
            practical solutions that grow with you over time.
          </p>
        </div>

      </div>
    </section>
  );
}
