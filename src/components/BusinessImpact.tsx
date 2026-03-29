import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Store,
  Building2,
  TrendingUp,
  LineChart,
  Network,
  Coins
} from "lucide-react";

const stats = [
  { value: "60M+", label: "MERCHANTS IN INDIA" },
  { value: "0", label: "NEW HARDWARE NEEDED" },
  { value: "10+", label: "REGIONAL LANGUAGES" },
  { value: "100%", label: "AUTOMATED REMINDERS" }
];

const merchantBenefits = [
  { text: "Better cash flow", icon: Zap },
  { text: "Reduced defaults", icon: ShieldCheck },
  { text: "Zero manual follow-ups", icon: Store },
  { text: "Confident udhaar decisions", icon: Building2 },
];

const paytmBenefits = [
  { text: "Higher merchant retention", icon: TrendingUp },
  { text: "Credit intelligence at ground level", icon: LineChart },
  { text: "Foundation for micro-lending products", icon: Coins },
  { text: "Revenue via premium analytics", icon: Network },
];

const BusinessImpact = () => {
  return (
    <div className="w-full flex flex-col">
      {/* 3rd Section: Platform Statistics */}
      <section id="platform-stats" className="relative py-12 md:py-16 lg:py-20 bg-[#0a0a0f] flex justify-center w-full">
        {/* Ambient Glow Effects for Stats */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5048e5]/5 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group w-full flex flex-col items-center justify-center text-center p-8 lg:p-10 rounded-[2rem] bg-[#0d0d16] border border-[#1b1b23] hover:bg-[#13131b] hover:border-[#5048e5]/40 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5048e5]/5 rounded-full blur-2xl group-hover:bg-[#5048e5]/10 transition-colors" />
                <div className="font-heading text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#c3c0ff] to-[#0ea5e9] bg-clip-text text-transparent tracking-[-0.02em] mb-3">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#918fa1] tracking-[0.1em] uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4th Section: Business Impact Dual Grid */}
      <section id="business-impact" className="relative py-12 md:py-16 lg:py-24 bg-[#0a0a0f] flex justify-center w-full">
        {/* Ambient Glow Effects for Impact */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[5%] w-[800px] h-[800px] bg-[#5048e5]/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-[#2c3ea3]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0f_100%)] opacity-80" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col items-center text-center mb-16 lg:mb-20"
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] text-[#e4e1ed] leading-tight max-w-4xl">
              Business <span className="bg-gradient-to-r from-[#c3c0ff] to-[#5048e5] bg-clip-text text-transparent">Impact</span>
            </h2>
          </motion.div>

          {/* 2-Column Symmetrical Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch justify-center">

            {/* For Merchants Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-full flex flex-col"
            >
              <div className="relative w-full h-full bg-[#0d0d16] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col items-center shadow-lg border border-[#1b1b23]">
                <div className="flex flex-col items-center justify-center gap-2 mb-10 text-center w-full shrink-0">
                  <h3 className="font-heading text-3xl font-bold text-[#e4e1ed] tracking-tight">For Merchants</h3>
                </div>

                {/* Strict Symmetrical 2x2 Inner Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 w-full flex-1">
                  {merchantBenefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="group h-full w-full flex flex-col items-center justify-center text-center p-6 rounded-[1.5rem] bg-[#13131b] hover:bg-[#1b1b23] border border-transparent transition-colors duration-300"
                    >
                      <div className="w-12 h-12 rounded-[1rem] bg-[#1f1f28] flex items-center justify-center shrink-0 mb-4 group-hover:scale-110 transition-transform">
                        <benefit.icon className="w-6 h-6 text-[#918fa1] group-hover:text-[#c3c0ff] transition-colors" />
                      </div>
                      <h4 className="font-heading font-medium text-[#c7c4d8] group-hover:text-[#e4e1ed] transition-colors text-base px-2">
                        {benefit.text}
                      </h4>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* For Paytm Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full h-full flex flex-col"
            >
              {/* Elevated Ambient Desktop Glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#c3c0ff]/15 to-[#5048e5]/20 rounded-[2.6rem] blur-[30px] opacity-40 pointer-events-none" />

              <div className="relative w-full h-full bg-[rgba(31,31,40,0.65)] backdrop-blur-[24px] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col items-center shadow-[0_24px_80px_-12px_rgba(80,72,229,0.15)] border border-[#5048e5]/20">
                <div className="flex flex-col items-center justify-center gap-2 mb-10 text-center w-full shrink-0">
                  <h3 className="font-heading text-3xl font-bold text-[#ffffff] tracking-tight">For Paytm</h3>
                </div>

                {/* Strict Symmetrical 2x2 Inner Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 w-full flex-1">
                  {paytmBenefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="group h-full w-full flex flex-col items-center justify-center text-center p-6 rounded-[1.5rem] bg-[#0d0d16]/30 hover:bg-[#1f1f28]/70 border border-transparent hover:border-[#5048e5]/30 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-[1rem] bg-[#5048e5]/15 flex items-center justify-center shrink-0 mb-4 group-hover:scale-110 group-hover:bg-[#5048e5]/25 transition-all">
                        <benefit.icon className="w-6 h-6 text-[#c3c0ff]" />
                      </div>
                      <h4 className="font-heading font-medium text-[#c7c4d8] group-hover:text-[#ffffff] transition-colors text-base px-2">
                        {benefit.text}
                      </h4>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessImpact;
