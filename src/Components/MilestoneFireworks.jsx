import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Milestone thresholds ─────────────────────────────────────────────────────
const MILESTONES = [7, 14, 21, 30, 50, 100];

// ─── Palette: warm gold → emerald → electric blue ────────────────────────────
const PARTICLE_COLORS = [
  "#fbbf24", "#f59e0b", "#10b981", "#34d399",
  "#3b82f6", "#818cf8", "#f472b6", "#fb923c",
];

// Generate particles with evenly distributed angles and random variation
function generateParticles(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (360 / count) * i;
    const angle = baseAngle + (Math.random() * 30 - 15); // ±15° jitter
    const distance = 40 + Math.random() * 55; // 40–95px travel
    const size = 3 + Math.random() * 4; // 3–7px
    const duration = 0.4 + Math.random() * 0.3; // 0.4–0.7s
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const rad = (angle * Math.PI) / 180;

    return {
      id: i,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      size,
      duration,
      color,
    };
  });
}

export default function MilestoneFireworks({ streak, onComplete }) {
  const [particles] = useState(() => generateParticles());
  const [visible, setVisible] = useState(true);

  // Self-destruct after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const milestoneLabel = streak >= 100 ? "💯" : streak >= 50 ? "🔥" : streak >= 30 ? "👑" : streak >= 21 ? "⚡" : streak >= 14 ? "💎" : "🎯";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      style={{ overflow: "visible" }}
    >
      {/* Central flash — scale burst */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2.5, 0], opacity: [1, 0.7, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute w-8 h-8 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)",
        }}
      />

      {/* Milestone emoji pop */}
      <motion.div
        initial={{ scale: 0, y: 0 }}
        animate={{ scale: [0, 1.6, 1], y: [0, -20, -30] }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.15,
        }}
        className="absolute text-lg z-10"
        style={{ top: "-10px" }}
      >
        {milestoneLabel}
      </motion.div>

      {/* Radial particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [1, 1.2, 0],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
            delay: Math.random() * 0.1,
          }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}

      {/* Streak count flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.8], y: [10, -5, -8, -15] }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        className="absolute text-[10px] font-black text-amber-400 tracking-widest whitespace-nowrap"
        style={{ top: "20px" }}
      >
        {streak} DAYS!
      </motion.div>
    </div>
  );
}

export { MILESTONES };
