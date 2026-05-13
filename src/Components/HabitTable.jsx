import React, { useEffect, useRef, useMemo, useState } from "react";
import { ref, set } from "firebase/database";
import { database } from "../../fireBase/fireBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faFire,
  faCheck,
  faCircle,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import {
  motion,
  AnimatePresence,
  useAnimation,
} from "framer-motion";
import { useAuth } from "../../Context/AurhContext";
import toast from "react-hot-toast";
import MilestoneFireworks, { MILESTONES } from "./MilestoneFireworks";

// ─── Physics constants ────────────────────────────────────────────────────────
const ROW_SPRING = { type: "spring", stiffness: 280, damping: 26, mass: 0.9 };
const CELL_SPRING = { type: "spring", stiffness: 420, damping: 14 };
const EXIT_SPRING = { type: "spring", stiffness: 320, damping: 30 };
const STREAK_PULSE = {
  scale: [1, 1.2, 1],
  rotate: [-10, 10, -5, 5, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut",
  },
};

// ─── CompletionCell ───────────────────────────────────────────────────────────
function CompletionCell({ completed, isFuture, isPast, isToday, onToggle }) {
  const controls = useAnimation();
  const prevCompleted = useRef(completed);
  const isLocked = isFuture || isPast;

  useEffect(() => {
    if (completed && !prevCompleted.current) {
      controls.start({
        scale: [1, 1.3, 0.9, 1.1, 1],
        transition: CELL_SPRING,
      });
    }
    prevCompleted.current = completed;
  }, [completed, controls]);

  return (
    <motion.button
      disabled={isLocked}
      onClick={onToggle}
      animate={controls}
      whileTap={!isLocked ? { scale: 0.8, transition: CELL_SPRING } : {}}
      whileHover={!isLocked ? {
        scale: 1.15,
        backgroundColor: completed ? "#10b981" : "rgba(51, 65, 85, 0.8)",
        boxShadow: completed ? "0 0 15px rgba(16, 185, 129, 0.4)" : "0 0 10px rgba(59, 130, 246, 0.2)"
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`
        w-9 h-9 rounded-xl mx-auto flex items-center justify-center text-[10px] relative transition-all duration-300
        ${
          isFuture
            ? "bg-slate-800/10 cursor-not-allowed opacity-20 border border-slate-700/30"
            : isPast && completed
            ? "bg-emerald-500/40 text-emerald-200/60 cursor-not-allowed border border-emerald-500/20 shadow-inner"
            : isPast && !completed
            ? "bg-slate-800/30 cursor-not-allowed opacity-40 border border-slate-700/20"
            : completed
            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50"
            : "bg-slate-800/60 hover:bg-slate-700/80 text-slate-500/0 hover:text-slate-400 border border-slate-700/50 backdrop-blur-xs"
        }
        ${isToday ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-950 z-10" : ""}
      `}
    >
      <AnimatePresence>
        {completed && !isFuture && (
          <motion.span
            key="ripple"
            className="absolute inset-0 rounded-xl bg-emerald-400/30"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {!isFuture && (
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={CELL_SPRING}
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
            </motion.div>
          ) : !isPast && (
            <motion.div
              key="dot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              whileHover={{ opacity: 1 }}
            >
              <FontAwesomeIcon icon={faCircle} className="text-[4px]" />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.button>
  );
}

// ─── HabitRow ─────────────────────────────────────────────────────────────────
function HabitRow({ habit, index, daysInMonth, getDateStr, todayStr, year, month, toggleCompletion, deleteHabit }) {
  const streak = useMemo(() => calculateStreak(habit.completed), [habit.completed]);
  const prevStreakRef = useRef(streak);
  const [showFireworks, setShowFireworks] = useState(false);

  const completionRate = useMemo(() => {
    const completedDays = Object.values(habit.completed || {}).filter(Boolean).length;
    return Math.min(100, (completedDays / daysInMonth) * 100);
  }, [habit.completed, daysInMonth]);

  // Detect milestone crossings
  useEffect(() => {
    const prev = prevStreakRef.current;
    if (streak !== prev) {
      const crossedMilestone = MILESTONES.some(m => streak >= m && prev < m);
      if (crossedMilestone) {
        setShowFireworks(true);
      }
      prevStreakRef.current = streak;
    }
  }, [streak]);

  return (
    <motion.tr
      layout
      custom={index}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
          opacity: 1,
          x: 0,
          transition: { ...ROW_SPRING, delay: i * 0.04 },
        }),
        exit: { opacity: 0, scale: 0.95, transition: EXIT_SPRING },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group hover:bg-white/[0.02] transition-colors duration-500"
      style={{ position: "relative" }}
    >
      <td className="sticky left-0 z-20 bg-slate-950/90 backdrop-blur-xl p-4 border-r border-white/[0.05] shadow-[10px_0_15px_-5px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-2 min-w-40">
          <div className="flex items-center gap-2 group/name">
            {/* Drag handle (visual indicator) */}
            <motion.div
              className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100 touch-none"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faGripVertical} className="text-[10px]" />
            </motion.div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-slate-100 text-sm tracking-tight truncate">
                {habit.name}
              </span>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-linear-to-r from-blue-500 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>

            <motion.button
              onClick={() => deleteHabit(habit.id)}
              whileHover={{ scale: 1.2, color: "#f87171" }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 text-slate-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="text-[11px]" />
            </motion.button>
          </div>

          <AnimatePresence>
            {streak > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-orange-400 text-[10px] font-bold relative"
              >
                <motion.div animate={STREAK_PULSE}>
                  <FontAwesomeIcon icon={faFire} className="filter drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]" />
                </motion.div>
                <span className="bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                  {streak} DAY STREAK
                </span>

                {/* Milestone fireworks */}
                <AnimatePresence>
                  {showFireworks && (
                    <MilestoneFireworks
                      streak={streak}
                      onComplete={() => setShowFireworks(false)}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>

      {Array.from({ length: daysInMonth }, (_, i) => {
        const dayNumber = i + 1;
        const dateStr = getDateStr(dayNumber);
        const cellDate = new Date(year, month, dayNumber);
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);
        const isFuture = cellDate > todayAtMidnight;
        const isPast = cellDate < todayAtMidnight;
        const isToday = dateStr === todayStr;
        const completed = habit.completed && !!habit.completed[dateStr] && !isFuture;

        return (
          <td key={i} className={`p-1.5 text-center transition-colors duration-500 ${isToday ? "bg-blue-500/[0.03]" : ""}`}>
            <CompletionCell
              completed={completed}
              isFuture={isFuture}
              isPast={isPast}
              isToday={isToday}
              onToggle={() => !isFuture && !isPast && toggleCompletion(habit.id, dateStr)}
            />
          </td>
        );
      })}
    </motion.tr>
  );
}

function calculateStreak(completedObj) {
  if (!completedObj) return 0;
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (completedObj[dateStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitTable({ selectedDate, habits, deleteHabit, onReorder }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const { currentUser } = useAuth();

  const scrollContainerRef = useRef(null);
  const todayRef = useRef(null);

  const getDateStr = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const toggleCompletion = (id, date) => {
    if (!currentUser) return;
    const habitRef = ref(database, `users/${currentUser.uid}/habits/${id}/completed/${date}`);
    const habit = habits.find((h) => h.id === id);
    const completed = habit.completed && habit.completed[date];
    set(habitRef, completed ? null : true);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const todayEl = todayRef.current;
    if (!container || !todayEl) return;
    const scrollTo = todayEl.offsetLeft - container.clientWidth / 2 + todayEl.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
  }, [selectedDate]);

  useEffect(() => {
    const completedHabitLength = habits.filter(h => h.completed && Object.keys(h.completed).length > 0).length;
    if (completedHabitLength === habits.length && habits.length > 0) {
      toast.success("All habits completed", {
        style: { borderRadius: "12px", background: "#064e3b", color: "#fff" },
      });
    }
  }, [habits]);

  const handleReorder = (newOrder) => {
    onReorder?.(newOrder);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-md shadow-2xl"
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05]">
            <th className="sticky left-0 z-30 bg-slate-950/95 backdrop-blur-xl p-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] border-r border-white/[0.05]">
              Habits
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayStr = getDateStr(i + 1);
              const isTodayCol = dayStr === todayStr;
              return (
                <th
                  key={i}
                  ref={isTodayCol ? todayRef : null}
                  className={`p-4 text-center font-bold text-[10px] min-w-12 transition-all duration-500
                    ${isTodayCol ? "text-blue-400 scale-110" : "text-slate-500 opacity-60"}`}
                >
                  <div className={`flex flex-col items-center gap-1 ${isTodayCol ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`}>
                    {isTodayCol && <div className="w-1 h-1 bg-blue-500 rounded-full mb-1 animate-pulse" />}
                    {i + 1}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/[0.02]">
          <AnimatePresence>
            {habits.length === 0 ? (
              <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td colSpan={daysInMonth + 1} className="p-20 text-center text-slate-500 font-medium italic">
                  Launch your first habit from the form above.
                </td>
              </motion.tr>
            ) : (
              habits.map((habit, index) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  index={index}
                  daysInMonth={daysInMonth}
                  getDateStr={getDateStr}
                  todayStr={todayStr}
                  year={year}
                  month={month}
                  toggleCompletion={toggleCompletion}
                  deleteHabit={deleteHabit}
                />
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
