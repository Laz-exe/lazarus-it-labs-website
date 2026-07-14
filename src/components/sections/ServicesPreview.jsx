const services = [
  {
    title: "Device Restoration",
    description:
      "Clean up, optimize, troubleshoot, and extend the life of computers and devices you already own.",
    accent: "01",
  },
  {
    title: "Network & Wi-Fi",
    description:
      "Improve coverage, reliability, and security for home networks and small office setups.",
    accent: "02",
  },
  {
    title: "Security & Backups",
    description:
      "Protect accounts, data, devices, and systems before small problems become emergencies.",
    accent: "03",
  },
  {
    title: "Small Business I.T.",
    description:
      "Practical support and planning for businesses that need dependable technology without enterprise complexity.",
    accent: "04",
  },
];

export default function ServicesPreview() {
  return (
    <section
  id="services"
  className="relative scroll-mt-56 overflow-hidden bg-[#05070D] px-6 py-32 text-white"
>
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Services
          </p>

          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Practical I.T. support without the unnecessary complexity.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Lazarus I.T. Labs helps people make better technology decisions — restoring what can be saved, protecting what matters, and improving the systems you rely on.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:bg-white/[0.065]"
            >
              <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-[#D4AF37]/10 blur-2xl transition group-hover:bg-[#D4AF37]/20" />

              <div className="relative mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                {service.accent}
              </div>

              <h3 className="relative text-2xl font-semibold">
                {service.title}
              </h3>

              <p className="relative mt-4 min-h-32 leading-7 text-slate-300">
                {service.description}
              </p>

              <a
                href="#message"
                className="relative mt-8 inline-flex font-semibold text-[#D4AF37] transition group-hover:translate-x-1"
              >
                Start here →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
