import Background from "@/components/global/background";
import Hero from "@/components/marketing/hero";
import { TrustedCompanies } from "@/components/marketing/TrustedCompanies";
import Spotlight from "@/components/ui/spotlight";
import Image from "next/image";
// Baaki components import karein (Background, Spotlight, Hero etc.)

const MarketingPage = () => {
  return (
    <main className="relative overflow-hidden">
      <Background>
        <Spotlight
          className="-top-64 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 opacity-60 sm:-top-56 sm:h-[48rem] sm:w-[48rem] lg:-top-64 lg:left-[62%] lg:h-[56rem] lg:w-[56rem]"
          fill="rgba(255,255,255,0.34)"
          blur={18}
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[30%] z-0 h-56 w-[min(42rem,88vw)] -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl"
        />
        <Hero />
      </Background>

      {/* Screen Readers ke liye Hidden Section */}
      <section id="how-it-works" className="sr-only" aria-label="How it works">
        Luro combines team context and artificial intelligence in one
        collaborative workspace.
      </section>

      {/* Hero Showcase / Dashboard Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        {/* Content & Heading */}

        {/* Dashboard Image Preview with Card Glow Effect */}
        <div className="relative w-full flex justify-center group">
          {/* Subtle background glow behind the image */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-500"></div>

          <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-sm shadow-2xl">
            <Image
              src="/images/dashboard.png"
              alt="AI Social Media Dashboard Preview"
              width={1080}
              height={1080}
              priority
              className="w-full h-auto rounded-xl object-contain max-w-5xl"
            />
          </div>
        </div>
      </section>
      <TrustedCompanies />
    </main>
  );
};

export default MarketingPage;
