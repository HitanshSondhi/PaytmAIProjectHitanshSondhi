import { motion } from "framer-motion";
import type { OrbState } from "../types";

interface VoiceOrbProps {
  state: OrbState;
  onClick: () => void;
  size?: number;
}

export function VoiceOrb({ state, onClick, size = 200 }: VoiceOrbProps) {
  const isActive = state === "listening" || state === "responding";

  return (
    <motion.button
      onClick={onClick}
      className="relative cursor-pointer focus:outline-none"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 197, 253, 0.3) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
        animate={{
          scale: isActive ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: isActive ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isActive ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle glow layer */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, rgba(99, 102, 241, 0.3) 50%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{
          scale: isActive ? [1, 1.15, 1] : [1, 1.08, 1],
          opacity: isActive ? [0.7, 1, 0.7] : [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: isActive ? 1.2 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Core orb with cosmic gradient */}
      <motion.div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: size * 0.15,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 30%),
            radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.8) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 70%, rgba(59, 130, 246, 0.6) 0%, transparent 35%),
            radial-gradient(ellipse at 80% 30%, rgba(196, 181, 253, 0.7) 0%, transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.9) 0%, rgba(67, 56, 202, 1) 50%, rgba(49, 46, 129, 1) 100%)
          `,
          boxShadow: `
            inset 0 0 60px rgba(139, 92, 246, 0.5),
            inset 0 0 30px rgba(196, 181, 253, 0.3),
            0 0 40px rgba(139, 92, 246, 0.4),
            0 0 80px rgba(99, 102, 241, 0.3)
          `,
        }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Inner nebula effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 25%),
              radial-gradient(ellipse at 75% 75%, rgba(147, 197, 253, 0.4) 0%, transparent 30%)
            `,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Sparkle highlights */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 8%),
              radial-gradient(circle at 65% 25%, rgba(255, 255, 255, 0.5) 0%, transparent 5%),
              radial-gradient(circle at 45% 65%, rgba(196, 181, 253, 0.6) 0%, transparent 10%)
            `,
          }}
          animate={{
            opacity: isActive ? [0.8, 1, 0.8] : [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Listening indicator ring */}
      {state === "listening" && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: [1, 1.3, 1.5],
            opacity: [0.5, 0.3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Responding pulse */}
      {state === "responding" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)",
            }}
            animate={{
              scale: [1, 1.4],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 60%)",
            }}
            animate={{
              scale: [1, 1.4],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
          />
        </>
      )}
    </motion.button>
  );
}
