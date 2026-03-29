import { motion } from "framer-motion";
import { BarChart3, Mic, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient Blurred Video Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50 mix-blend-screen pointer-events-none">
        <div className="absolute inset-0 bg-[#030303]/40 backdrop-blur-[100px] z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-[120%] h-[120%] object-cover blur-[60px]"
        >
          <source src="/videos/Financial_network_expands_202603251528.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="container relative z-20 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          <span className="text-sm font-medium tracking-widest text-zinc-300 uppercase">The Next-Gen Digital Concierge</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[1.05] font-['Space_Grotesk'] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500"
        >
          Voice Ledger <br />
          <span
            className="text-transparent bg-clip-text drop-shadow-[0_0_40px_rgba(139,92,246,0.5)] inline-block pb-2"
            style={{
              backgroundImage: "linear-gradient(90deg, #c084fc, #22d3ee, #c084fc)",
              backgroundSize: "200% auto",
              animation: "gradientShift 4s linear infinite",
            }}
          >
            Reimagined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-xl md:text-2xl text-zinc-400 max-w-3xl mb-14 leading-relaxed font-light"
        >
          A high-end, gallery-like experience where data breathes. Control your merchant operations with just your voice. Intelligent, serene, and authoritative.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 items-center"
        >
          <Link
            to="/app"
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl text-white font-medium text-lg overflow-hidden transition-all hover:scale-105 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Mic className="w-5 h-5 relative z-10 text-cyan-400" />
            <span className="relative z-10 tracking-wide">Launch Voice Agent</span>
          </Link>

          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 backdrop-blur-md text-zinc-300 font-medium text-lg transition-all hover:text-white"
          >
            <BarChart3 className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            <span className="tracking-wide">Merchant Dashboard</span>
          </Link>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            const targetSection = document.getElementById('problem-solution');
            targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <span className="text-zinc-500 text-sm tracking-widest uppercase group-hover:text-zinc-300 transition-colors">Discover More</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
