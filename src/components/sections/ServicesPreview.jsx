const services = [
  {
    title: "Device Restoration",
    description:
      "Troubleshoot, repair, clean up, and optimize the computers and devices you already own.",
  },
  {
    title: "Network & Wi-Fi",
    description:
      "Set up reliable home and office networks with better coverage, security, and performance.",
  },
  {
    title: "Security & Backups",
    description:
      "Protect your data, accounts, devices, and systems before problems become emergencies.",
  },
  {
    title: "Small Business I.T.",
    description:
      "Practical technology support and planning for small businesses that need dependable systems.",
  },
];

export default function ServicesPreview() {
  return (
    <section id="services" className="bg-[#05070D] px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Services
          </p>

          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Practical I.T. help for the technology you depend on.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            From everyday device problems to small business infrastructure, Lazarus I.T. Labs focuses on clear advice, reliable systems, and technology that lasts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-white/[0.06]"
            >
              <div className="mb-8 h-12 w-12 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10" />

              <h3 className="text-2xl font-semibold">{service.title}</h3>

              <p className="mt-4 leading-7 text-slate-300">
                {service.description}
              </p>

              <a
                href="#contact"
                className="mt-8 inline-flex font-semibold text-[#D4AF37]"
              >
                Learn More →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
