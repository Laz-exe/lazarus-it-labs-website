import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-8 py-5">
      <div className="mx-auto flex min-h-44 max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-black/70 px-8 py-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-primary.png"
            alt="Lazarus I.T. Labs"
            width={240}
            height={120}
            priority
            className="h-auto w-60"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex w-full max-w-4xl justify-evenly">
            <Link href="/" className="text-xl font-medium text-[#D4AF37] transition hover:text-white">
              Home
            </Link>

            <Link href="#services" className="text-xl font-medium text-slate-200 transition hover:text-white">
              Services
            </Link>

            <Link href="#about" className="text-xl font-medium text-slate-200 transition hover:text-white">
              About
            </Link>

            <Link href="#contact" className="text-xl font-medium text-slate-200 transition hover:text-white">
              Contact
            </Link>
          </div>
        </nav>

        <Link
          href="#contact"
          className="hidden rounded-2xl bg-[#D4AF37] px-8 py-4 text-lg font-semibold text-black transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D4AF37]/30 md:inline-flex"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}
