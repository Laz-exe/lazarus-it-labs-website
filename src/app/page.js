import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070D] text-white">
      <Navbar />
      <Hero />
      <ServicesPreview />
    </main>
  );
}
