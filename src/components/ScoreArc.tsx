import { motion } from "framer-motion";

interface ScoreArcProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function ScoreArc({ score, size = 80, showLabel = false }: ScoreArcProps) {
  const strokeWidth = size > 60 ? 6 : 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc calculation: 270 degrees, starting at -135 degrees
  const circumference = 2 * Math.PI * radius;
  const arcLength = (270 / 360) * circumference;
  const filledLength = (score / 100) * arcLength;
  const dashOffset = arcLength - filledLength;

  // Color based on score
  const getColor = () => {
    if (score >= 85) return "#22c55e"; // green
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getCategory = () => {
    if (score >= 85) return "Good";
    if (score >= 60) return "Average";
    return "Risky";
  };

  const color = getColor();

  // Create arc path
  const createArc = () => {
    const startAngle = -135 * (Math.PI / 180);
    const endAngle = 135 * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${x2} ${y2}`;
  };

  const arcPath = createArc();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <path
            d={arcPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        {/* Score number */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ color, fontSize: size * 0.28 }}
        >
          {score}
        </div>
      </div>
      {showLabel && (
        <span
          className="text-xs mt-1 font-medium"
          style={{ color }}
        >
          {getCategory()}
        </span>
      )}
    </div>
  );
}
