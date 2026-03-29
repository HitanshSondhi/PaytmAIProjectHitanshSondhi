import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const location = useLocation();
  const isVoice = location.pathname === "/app";
  const isDashboard = location.pathname === "/dashboard";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:pb-6">
      <div
        className="mx-auto max-w-md h-16 rounded-2xl flex items-center justify-center gap-16"
        style={{
          background: "rgba(20, 20, 35, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Voice Tab */}
        <Link to="/app" className="relative flex flex-col items-center gap-1">
          <motion.div
            className="flex flex-col items-center gap-1 px-6 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-200 ${
                isVoice
                  ? "bg-indigo-500/20"
                  : "bg-transparent hover:bg-white/5"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isVoice ? "#818cf8" : "rgba(255, 255, 255, 0.4)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-200"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                isVoice ? "text-indigo-400" : "text-white/40"
              }`}
            >
              Voice
            </span>
          </motion.div>
          {isVoice && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full"
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            />
          )}
        </Link>

        {/* Dashboard Tab */}
        <Link
          to="/dashboard"
          className="relative flex flex-col items-center gap-1"
        >
          <motion.div
            className="flex flex-col items-center gap-1 px-6 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-200 ${
                isDashboard
                  ? "bg-indigo-500/20"
                  : "bg-transparent hover:bg-white/5"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDashboard ? "#818cf8" : "rgba(255, 255, 255, 0.4)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-200"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                isDashboard ? "text-indigo-400" : "text-white/40"
              }`}
            >
              Dashboard
            </span>
          </motion.div>
          {isDashboard && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full"
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
