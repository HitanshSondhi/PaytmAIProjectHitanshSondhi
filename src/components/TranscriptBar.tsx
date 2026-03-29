import { AnimatePresence, motion } from "framer-motion";

interface TranscriptBarProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isResponding: boolean;
  onClick: () => void;
}

export function TranscriptBar({
  transcript,
  interimTranscript,
  isListening,
  isResponding,
  onClick,
}: TranscriptBarProps) {
  const displayText = interimTranscript || transcript;
  const isActive = isListening || isResponding;

  const getDisplayContent = () => {
    if (isResponding) return "processing...";
    if (isListening && displayText) return displayText;
    if (isListening) return "listening...";
    return "tap to speak...";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isResponding}
      className="w-full max-w-md mx-auto px-4"
      whileHover={{ scale: isResponding ? 1 : 1.01 }}
      whileTap={{ scale: isResponding ? 1 : 0.99 }}
    >
      <div
        className="relative px-6 py-4 rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: isActive
            ? "rgba(99, 102, 241, 0.15)"
            : "rgba(30, 30, 50, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${
            isActive ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)"
          }`,
          boxShadow: isActive
            ? "0 0 30px rgba(99, 102, 241, 0.2)"
            : "0 4px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={getDisplayContent()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`text-center text-sm sm:text-base ${
              isActive ? "text-white/90" : "text-white/50"
            }`}
          >
            {getDisplayContent()}
          </motion.p>
        </AnimatePresence>

        {/* Listening animation indicator */}
        {isListening && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-indigo-400 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
          />
        )}

        {/* Processing animation */}
        {isResponding && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-indigo-400"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.button>
  );
}
