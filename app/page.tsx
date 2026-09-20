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
import BuyRCX from "@/components/BuyRCX";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

export default function Home() {
  return (
    <LanguageProvider>
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <Particles />

      <Hero />
      <BuyRCX />

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
    </LanguageProvider>
  );
}