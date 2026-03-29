import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Phone,
  BarChart3,
  Mic,
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  X,
  Check,
  ChevronDown
} from "lucide-react";

const problems = [
  {
    icon: BookOpen,
    title: "Manual Notebooks",
    description: "Paper-based credit tracking prone to errors and loss",
  },
  {
    icon: Brain,
    title: "Memory-Based Trust",
    description: "Unreliable judgment for customer creditworthiness",
  },
  {
    icon: Phone,
    title: "Phone Follow-ups",
    description: "Time-consuming calls for payment reminders",
  },
  {
    icon: BarChart3,
    title: "No Data Insights",
    description: "Zero visibility into customer payment patterns",
  },
];

const solutions = [
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Speak naturally to record transactions instantly",
  },
  {
    icon: FileText,
    title: "Digital Ledger",
    description: "Automatic udhaar tracking with smart due dates",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Reminders",
    description: "Automated payment notifications to customers",
  },
  {
    icon: TrendingUp,
    title: "AI Credit Scoring",
    description: "Data-driven reliability scores per customer",
  },
];

const ProblemSolution = () => {
  return (
    <section id="problem-solution" className="relative py-24 lg:py-32 w-full bg-gradient-to-b from-background via-background to-background/95 flex flex-col items-center">
      {/* Animated background elements. Positioned securely without translate-x offsets that could break alignment */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-background/80" />
      </div>

      {/* 1. Wrapped the entire section content inside a properly centered container */}
      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center w-full mb-16 lg:mb-20 flex flex-col items-center justify-center mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20 mx-auto"
          >
            Why Voice Ledger?
          </motion.span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-center w-full">
            From <span className="text-red-400">Chaos</span> to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Clarity</span>
          </h2>
          <p className="text-muted-foreground font-body text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-center w-full">
            See how we transform the daily struggles of credit management into a seamless, intelligent experience
          </p>
        </motion.div>

        {/* Main Comparison Container */}
        <div className="relative w-full">
          {/* Strict 1fr auto 1fr balanced layout. Enforced minmax(0,1fr) to prevent text width from displacing the center */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-8 lg:gap-12 items-stretch w-full mx-auto justify-center">

            {/* Problems Card */}
            {/* Removed x-axis offsets (-40) and replaced with opacity/y scaling so no physical shifting occurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group flex flex-col w-full h-full min-w-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative bg-gradient-to-br from-[#1a1a2e]/90 to-[#16162a]/90 backdrop-blur-xl border border-red-500/10 rounded-3xl p-6 sm:p-8 lg:p-10 h-full flex flex-col w-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/20 shrink-0">
                    <X className="w-7 h-7 text-red-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white truncate w-full">The Old Way</h3>
                    <p className="text-red-400/80 text-sm font-medium truncate w-full">Frustrating & Error-Prone</p>
                  </div>
                </div>

                {/* Problem Items */}
                {/* Enforced grid-rows to keep items balanced horizontally and vertically */}
                <div className="grid grid-rows-4 gap-4 flex-1 w-full">
                  {problems.map((problem, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-red-500/5 hover:border-red-500/10 transition-all duration-300 w-full h-full min-w-0"
                    >
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover/item:bg-red-500/20 transition-colors">
                        <problem.icon className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0 text-left h-full">
                        <h4 className="font-semibold text-white mb-1 group-hover/item:text-red-300 transition-colors truncate w-full">
                          {problem.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2 w-full">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Center Connection / Arrow */}
            {/* Placed explicitly within an auto column of the grid for perfectly mathematical alignment */}
            <div className="hidden lg:flex flex-col items-center justify-center w-16 pointer-events-none z-20">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0"
              >
                <ArrowRight className="w-7 h-7 text-white" />
              </motion.div>
            </div>

            {/* Solutions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} // Removed x: 40
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group flex flex-col w-full h-full min-w-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative bg-gradient-to-br from-[#1a2e1a]/90 to-[#162a2a]/90 backdrop-blur-xl border border-emerald-500/10 rounded-3xl p-6 sm:p-8 lg:p-10 h-full flex flex-col w-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white truncate w-full">The Voice Ledger Way</h3>
                    <p className="text-emerald-400/80 text-sm font-medium truncate w-full">Smart & Effortless</p>
                  </div>
                </div>

                {/* Solution Items */}
                <div className="grid grid-rows-4 gap-4 flex-1 w-full">
                  {solutions.map((solution, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-emerald-500/5 hover:border-emerald-500/10 transition-all duration-300 w-full h-full min-w-0"
                    >
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-500/20 transition-colors">
                        <solution.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0 text-left h-full">
                        <h4 className="font-semibold text-white mb-1 group-hover/item:text-emerald-300 transition-colors truncate w-full">
                          {solution.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2 w-full">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 lg:mt-16 w-full max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { value: "10x", label: "Faster Recording" },
              { value: "90%", label: "Less Errors" },
              { value: "3hrs", label: "Daily Time Saved" },
              { value: "100%", label: "Digital Backup" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors w-full min-w-0"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent mb-1 truncate w-full">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate w-full">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Subtle Scroll Indicator overlapping bottom edge pointing towards the third section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
        <button
          onClick={(e) => {
            const section = e.currentTarget.closest('section');
            if (section?.nextElementSibling) {
              section.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-muted-foreground hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Scroll to next section"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 opacity-90" />
          </motion.div>
        </button>
      </div>
    </section>
  );
};

export default ProblemSolution;