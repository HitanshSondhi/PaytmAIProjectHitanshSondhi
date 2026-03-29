import { motion } from "framer-motion";
import type { Lang } from "../types";

interface HeaderProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  demoMode: boolean;
  onDemoToggle: () => void;
}

export function Header({
  lang,
  onLangChange,
  demoMode,
  onDemoToggle,
}: HeaderProps) {
  return (
    <header className="relative z-20 px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-2xl"
        style={{
          background: "rgba(20, 20, 35, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Left: Store name */}
        <div>
          <h1 className="text-white font-semibold text-base sm:text-lg">
            Sharma Kirana Store
          </h1>
          <p className="text-white/40 text-xs sm:text-sm">Merchant Dashboard</p>
        </div>

        {/* Right: Language selector and Demo toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Selector */}
          <div
            className="flex items-center rounded-lg overflow-hidden text-xs sm:text-sm"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => onLangChange("en-IN")}
              className={`px-2 sm:px-3 py-1.5 transition-all duration-200 ${
                lang === "en-IN"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              English
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => onLangChange("hi-IN")}
              className={`px-2 sm:px-3 py-1.5 transition-all duration-200 ${
                lang === "hi-IN"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Hindi
            </button>
          </div>

          {/* Demo Toggle */}
          <motion.button
            onClick={onDemoToggle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: demoMode
                ? "rgba(34, 197, 94, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${
                demoMode ? "rgba(34, 197, 94, 0.3)" : "rgba(255, 255, 255, 0.1)"
              }`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className={`text-xs sm:text-sm font-medium ${
                demoMode ? "text-green-400" : "text-white/50"
              }`}
            >
              Demo
            </span>
            <div
              className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                demoMode ? "bg-green-500" : "bg-white/20"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow"
                animate={{
                  left: demoMode ? 16 : 2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
