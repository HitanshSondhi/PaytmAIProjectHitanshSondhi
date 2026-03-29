import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            style={{
              background: "rgba(15, 15, 30, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-white font-semibold text-lg">{title}</h2>
              <motion.button
                onClick={onClose}
                className="text-white/40 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Reusable form styles
export const inputClassName = `
  w-full rounded-xl px-4 py-3
  text-white placeholder-white/30 text-sm
  focus:outline-none transition-all duration-200
  bg-white/5 border border-white/10
  focus:border-indigo-400/50 focus:bg-white/8
`;

export const labelClassName =
  "text-white/50 text-xs uppercase tracking-wider mb-2 block font-medium";

export const buttonClassName = `
  w-full font-medium rounded-xl py-3.5 transition-all duration-200 mt-4
  disabled:opacity-50 disabled:cursor-not-allowed
  bg-indigo-500 hover:bg-indigo-400 text-white
  active:scale-[0.99]
`;
