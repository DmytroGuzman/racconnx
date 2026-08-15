import Navbar from "@/components/Navbar";
import Particles from "@/components/Particles";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Tokenomics from "@/components/Tokenomics";
import Roadmap from "@/components/Roadmap";
import Whitepaper from "@/components/Whitepaper";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import SectionDivider from "@/components/SectionDivider";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-black">
      <Navbar />
      <Particles />

      <Hero />

      <SectionDivider />

      <About />

      <SectionDivider />

      <Tokenomics />

      <SectionDivider />

      <Roadmap />

      <SectionDivider />

      <Whitepaper />

      <SectionDivider />

      <FAQ />

      <Footer />
    </main>
  );
}