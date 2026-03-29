import { motion } from "framer-motion";
import { BarChart3, Mic, ShieldCheck, Wallet, ChevronDown } from "lucide-react";

const features = [
  {
    title: "Intelligent Voice Commands",
    description: "Experience hands-free merchant operations. Our advanced NLP understands natural language to fetch analytics, execute transactions, and provide instant summaries.",
    video: "https://res.cloudinary.com/dfhcviz9w/video/upload/v1774450963/Digital_Finance_Network_Animation_Generation_zgotan.mp4",
    icon: Mic,
  },
  {
    title: "Real-Time Digital Ledger",
    description: "Every transaction, update, and settlement is reflected instantly across your ecosystem. A true source of truth, beautifully rendered.",
    video: "https://res.cloudinary.com/dfhcviz9w/video/upload/v1774459066/Digital_payment_ledger_202603251528_zd2jhu.mp4",
    icon: Wallet,
  },
  {
    title: "Secure Financial Network",
    description: "Bank-grade encryption meets decentralized transparency. Your data is isolated, protected, and consistently monitored for total peace of mind.",
    video: "https://res.cloudinary.com/dfhcviz9w/video/upload/v1774459066/Digital_Finance_Network_Animation_Generation_kj9u7l.mp4",
    icon: ShieldCheck,
  },
  {
    title: "Actionable Insights",
    description: "Transform raw data into meaningful metrics. Generate reports and visualize trends with a single query, empowering smarter business decisions.",
    video: "https://res.cloudinary.com/dfhcviz9w/video/upload/v1774459061/Fintech_Animation_Generation_npgvdg.mp4",
    icon: BarChart3,
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-32 bg-[#030303] flex justify-center w-full">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          const Icon = feature.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center justify-between gap-12 lg:gap-20 mb-40 last:mb-0`}
            >
              {/* Text Content */}
              <div className="w-full lg:w-1/2 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                  <Icon className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
                  {feature.title}
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light max-w-xl">
                  {feature.description}
                </p>
              </div>

              {/* Video Content */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm aspect-[16/10] shadow-2xl shadow-black/50 transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover mix-blend-screen"
                  >
                    <source src={feature.video} type="video/mp4" />
                  </video>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Downward Scroll Indicator to Business Impact */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer group z-50 mt-16 lg:mt-0"
        onClick={() => {
          const targetSection = document.getElementById('business-impact');
          targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        <div className="relative w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 group-hover:border-[#5048e5]/40 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-zinc-400 group-hover:text-[#c3c0ff] transition-colors" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
