import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { loginUser } from "../../fireBase/auth";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Physics constants ────────────────────────────────────────────────────────
// Panel entrance: slightly underdamped spring gives the panel a confident snap-in
// stiffness 280 → not sluggish, damping 24 → one soft overshoot, mass 1.2 → feels weighty
const PANEL_SPRING = { type: "spring", stiffness: 280, damping: 24, mass: 1.2 };

// Field stagger: each form field floats in 0.08s after the previous
const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22, delay: i * 0.08 },
  }),
};

export default function Login() {
  const [tip, setTip] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const tipRef = useRef(null);

  useEffect(() => {
    const handleTip = (event) => {
      if (tip && tipRef.current && !tipRef.current.contains(event.target)) {
        setTip(false);
      }
    };
    document.addEventListener("click", handleTip);
    return () => document.removeEventListener("click", handleTip);
  }, [tip]);

  const handleSubmit = async (e) => {
    console.log(e);
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(userId, password);
      setLoading(false);
      toast.success("Successfully logged in!");
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Failed to login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-linear-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">

      {/* ── Left Panel — Animated brand wordmark ── */}
      <motion.div
        className="hidden md:flex h-screen w-1/2 rounded-2xl flex-col gap-4 items-center justify-center text-center text-gray-50 bg-blue-300/10 backdrop-blur-lg"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={PANEL_SPRING}
      >
        {/* Animated concentric rings behind the title */}
        <div className="relative flex items-center justify-center mb-2">
          {[160, 110, 70].map((size, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-blue-400/20"
              style={{ width: size, height: size }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 3 + i * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
          <motion.h1
            className="text-7xl font-bold text-white/90 relative z-10 leading-tight"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.2 }}
          >
            Habit
            <br />
            Tracker
          </motion.h1>
        </div>

        <motion.p
          className="text-xl text-white/50 max-w-xs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.35 }}
        >
          Every day, it gets a little easier. But you gotta do it every day,
          that's the hard part.
        </motion.p>
      </motion.div>

      {/* ── Right Panel — Login form ── */}
      <motion.div
        className="flex-1 h-screen flex flex-col gap-6 items-center justify-center px-6 md:px-12 text-gray-50"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={PANEL_SPRING}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-semibold mb-6 text-white"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
        >
          Login to Habit Tracker
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#282142]/70 p-8 rounded-2xl backdrop-blur-md flex flex-col gap-5 shadow-lg"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
        >
          {/* Unique ID field */}
          <motion.div
            className="relative flex items-center gap-2"
            custom={0}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <input
              type="text"
              placeholder="Unique ID (only numbers)"
              inputMode="numeric"
              value={userId}
              minLength={5}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setUserId(val);
              }}
              className="p-4 rounded-xl bg-transparent scrollbar-hide border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition flex-1"
            />

            <div className="relative group" ref={tipRef}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="text-gray-400 w-5 h-5 cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => setTip(!tip)}
              />
              <AnimatePresence>
                {tip && (
                  <motion.div
                    key="tip"
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-10"
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    Your unique ID must contain at least 5 numbers
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Password field */}
          <motion.div
            custom={1}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <input
              type="password"
              placeholder="Password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </motion.div>

          {/* Submit button */}
          <motion.div
            custom={2}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.35)" } : {}}
              whileTap={!loading ? { scale: 0.94, transition: { type: "spring", stiffness: 500, damping: 15 } } : {}}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className={`w-full bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-md transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Logging in…
                  </motion.span>
                ) : (
                  <motion.span
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Login
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div
          className="flex flex-col items-center gap-2 mt-4 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <p>
            Don't have an account?{" "}
            <a href="/signin" className="text-blue-400 hover:underline">
              Register here
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
