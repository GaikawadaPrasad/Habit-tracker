import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { registerUser } from "../../fireBase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Physics constants ────────────────────────────────────────────────────────
const PANEL_SPRING = { type: "spring", stiffness: 280, damping: 24, mass: 1.2 };

const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22, delay: i * 0.08 },
  }),
};

export default function Signin() {
  const [tip, setTip] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const tipRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTip = (e) => {
      if (tip && tipRef.current && !tipRef.current.contains(e.target)) {
        setTip(false);
      }
    };
    document.addEventListener("click", handleTip);
    return () => document.removeEventListener("click", handleTip);
  }, [tip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(userId, password, name);
      setLoading(false);
      toast.success("Welcome" + (name ? `, ${name}` : "") + "!");
      navigate("/");
    } catch (e) {
      toast.error("Failed to register. Please try again.");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 overflow-hidden">

      {/* ── Left Panel — Brand wordmark with concentric rings ── */}
      <motion.div
        className="hidden md:flex h-screen w-1/2 flex-col gap-6 items-center justify-center text-center text-gray-50 bg-emerald-500/[0.03] border-r border-white/[0.05] backdrop-blur-xl relative overflow-hidden"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={PANEL_SPRING}
      >
        {/* Concentric rings — breathing animation */}
        <div className="relative flex items-center justify-center mb-4">
          {[180, 130, 80].map((size, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-emerald-400/15"
              style={{ width: size, height: size }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3.5 + i * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
          <motion.h1
            className="text-7xl font-black text-white/90 relative z-10 leading-tight tracking-tighter"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.2 }}
          >
            Habit
            <br />
            <span className="text-emerald-400">Tracker</span>
          </motion.h1>
        </div>

        <motion.p
          className="text-lg text-white/40 max-w-xs font-medium tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.35 }}
        >
          Build habits. Track progress. Stay consistent.
        </motion.p>

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </motion.div>

      {/* ── Right Panel — Registration form ── */}
      <motion.div
        className="flex-1 h-screen flex flex-col gap-6 items-center justify-center px-6 md:px-12 text-gray-50"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={PANEL_SPRING}
      >
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
        >
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            Create Account
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
            Initialize your protocol
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-slate-900/40 border border-white/[0.05] p-8 rounded-3xl backdrop-blur-2xl flex flex-col gap-5 shadow-2xl"
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
              className="flex-1 p-4 rounded-2xl bg-slate-900/40 border border-white/[0.08] text-white placeholder-slate-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-300 font-medium tracking-tight"
            />

            <div className="relative" ref={tipRef}>
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="text-slate-500 w-5 h-5 cursor-pointer hover:text-slate-300 transition-colors"
                onClick={() => setTip(!tip)}
              />
              <AnimatePresence>
                {tip && (
                  <motion.div
                    key="tip"
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-slate-800 border border-white/[0.1] text-white text-xs font-medium rounded-xl whitespace-nowrap z-10 shadow-xl"
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

          {/* Name field */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900/40 border border-white/[0.08] text-white placeholder-slate-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-300 font-medium tracking-tight"
            />
          </motion.div>

          {/* Password */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <input
              type="password"
              placeholder="Password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900/40 border border-white/[0.08] text-white placeholder-slate-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-300 font-medium tracking-tight"
            />
          </motion.div>

          {/* Confirm Password */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900/40 border border-white/[0.08] text-white placeholder-slate-500 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-300 font-medium tracking-tight"
            />
          </motion.div>

          {/* Submit button */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? {
                scale: 1.03,
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.3)",
              } : {}}
              whileTap={!loading ? {
                scale: 0.95,
                transition: { type: "spring", stiffness: 500, damping: 15 },
              } : {}}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className={`w-full relative overflow-hidden py-4 rounded-2xl font-black text-white shadow-xl transition-all duration-300 ${
                loading
                  ? "bg-slate-700 opacity-50 cursor-not-allowed"
                  : "bg-linear-to-r from-emerald-500 to-blue-500 hover:shadow-emerald-500/20"
              }`}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="tracking-tight"
                  >
                    Creating account…
                  </motion.span>
                ) : (
                  <motion.span
                    key="signup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="tracking-tight"
                  >
                    Create Account
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div
          className="flex flex-col items-center gap-2 mt-4 text-sm text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-emerald-400 hover:underline font-bold">
              Login here
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
