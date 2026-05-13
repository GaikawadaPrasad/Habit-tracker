import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Physics: Orbiting rings use spring-based rotation, not keyframe timing ──
// Each ring has a different angular velocity and radius to feel natural

const RINGS = [
  { size: 120, strokeWidth: 3, color: "#3b82f6", duration: 1.4, reverse: false, opacity: 0.9 },
  { size: 80, strokeWidth: 2, color: "#10b981", duration: 1.0, reverse: true, opacity: 0.7 },
  { size: 50, strokeWidth: 2, color: "#6366f1", duration: 0.7, reverse: false, opacity: 0.8 },
];

export default function LoadingPage() {
  const [dots, setDots] = useState("");

  // Animated dot trail for "Loading" text
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 380);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950 gap-10">

      {/* ── Concentric physics rings ── */}
      <div className="relative flex items-center justify-center" style={{ width: 144, height: 144 }}>

        {RINGS.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: ring.size,
              height: ring.size,
              borderRadius: "50%",
              border: `${ring.strokeWidth}px solid transparent`,
              borderTopColor: ring.color,
              borderRightColor: `${ring.color}55`,
              opacity: ring.opacity,
            }}
            animate={{ rotate: ring.reverse ? -360 : 360 }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Center pulsing core */}
        <motion.div
          className="w-5 h-5 rounded-full bg-blue-500"
          animate={{
            scale: [1, 1.35, 1],
            opacity: [1, 0.55, 1],
            boxShadow: [
              "0 0 0px 0px rgba(59,130,246,0.5)",
              "0 0 18px 6px rgba(59,130,246,0.3)",
              "0 0 0px 0px rgba(59,130,246,0.5)",
            ],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ── Animated wordmark ── */}
      <div className="flex flex-col items-center gap-2">
        <motion.p
          className="text-white text-lg font-semibold tracking-widest"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.2 }}
        >
          HabitTracker
        </motion.p>

        {/* Dot-trail loading text */}
        <div className="flex items-center gap-1 h-6">
          <motion.span
            className="text-slate-400 text-sm tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Loading
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.span
              key={dots}
              className="text-blue-400 text-sm font-bold w-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {dots}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Animated progress bar */}
        <motion.div className="w-32 h-0.5 bg-slate-800 rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
