import FeaturesSection from "../components/FeaturesSection";
import HeroSection from "../components/HeroSection";
import ProblemSolutionSection from "../components/ProblemSolution";
import BusinessImpact from "../components/BusinessImpact";
import { ChevronUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-purple-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Section Divider after Hero */}
      <div className="relative h-24 md:h-32 bg-gradient-to-b from-transparent via-[#030303] to-[#030303]">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>
      
      {/* Problem/Solution Section */}
      <ProblemSolutionSection />
      
      {/* Section Divider after Problem/Solution */}
      <div className="relative h-16 md:h-24 bg-[#030303]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex items-center gap-4 px-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700/50" />
          <div className="w-2 h-2 rounded-full bg-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700/50" />
        </div>
      </div>
      
      {/* Features Section */}
      <FeaturesSection />

      {/* Section Divider after Features */}
      <div className="relative h-16 md:h-24 bg-[#030303]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flex items-center gap-4 px-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700/50" />
          <div className="w-2 h-2 rounded-full bg-[#5048e5]/50 shadow-[0_0_10px_rgba(80,72,229,0.5)]" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700/50" />
        </div>
      </div>
      
      {/* Business Impact Section */}
      <BusinessImpact />

      {/* Back to Top Section */}
      <div className="relative pb-16 pt-8 bg-[#030303] flex justify-center">
        <button
          onClick={() => {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
              heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="group flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all">
            <ChevronUp className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <span className="text-zinc-500 text-xs tracking-widest uppercase font-medium group-hover:text-zinc-300 transition-colors">
            Back to Top
          </span>
        </button>
      </div>

      {/* Gradient animation keyframe */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}