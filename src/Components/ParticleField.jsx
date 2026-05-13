import React, { useMemo } from "react";

// ─── Ambient Particle Field ──────────────────────────────────────────────────
// Pure CSS animations — zero JS tick cost. Each particle drifts upward at its
// own pace with randomized position, opacity, size, and duration.
// GPU-composited via will-change: transform.

function generateParticles(count = 25) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${60 + Math.random() * 60}%`, // start from lower half+
    size: 1.5 + Math.random() * 3, // 1.5–4.5px
    opacity: 0.03 + Math.random() * 0.07, // 0.03–0.10 — extremely subtle
    duration: 15 + Math.random() * 20, // 15–35s drift
    delay: Math.random() * 15, // desynchronize all particles
    hue: Math.random() > 0.5 ? "blue" : "emerald",
  }));
}

export default function ParticleField() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes particle-drift {
          0% {
            transform: translateY(0) translateX(0);
            opacity: var(--p-opacity);
          }
          50% {
            transform: translateY(-50vh) translateX(10px);
            opacity: calc(var(--p-opacity) * 1.5);
          }
          100% {
            transform: translateY(-110vh) translateX(-5px);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.hue === "blue" ? "rgba(59, 130, 246, 0.8)" : "rgba(16, 185, 129, 0.8)",
            opacity: p.opacity,
            "--p-opacity": p.opacity,
            animation: `particle-drift ${p.duration}s ${p.delay}s linear infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
