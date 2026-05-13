import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const BTN_SPRING = { type: "spring", stiffness: 600, damping: 20 };

function HabitForm({ addHabit }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addHabit(input.trim());
    setInput("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 800);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative flex-1 group">
        <motion.div
          animate={input.length > 0 ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
        />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your next ritual?"
          className="relative w-full bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] text-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/40 transition-all duration-500 placeholder:text-slate-500 font-medium tracking-tight shadow-2xl"
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 items-center pointer-events-none">
          <AnimatePresence>
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        type="submit"
        whileHover={{ 
          scale: 1.05, 
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
        }}
        whileTap={{ scale: 0.95, transition: BTN_SPRING }}
        className="relative px-8 py-4 bg-slate-800 border border-white/[0.1] text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-2xl group/btn"
      >
        <motion.div 
          className="absolute inset-0 bg-linear-to-r from-blue-600 to-emerald-500 opacity-80 group-hover/btn:opacity-100 transition-opacity"
        />
        
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              className="absolute inset-0 bg-white/20 rounded-full"
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-2">
          <motion.div
            animate={submitted ? { rotate: 360, scale: [1, 1.4, 1] } : {}}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </motion.div>
          <span className="tracking-tight">Add Habit</span>
        </div>
      </motion.button>
    </motion.form>
  );
}

export default HabitForm;