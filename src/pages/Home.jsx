import toast, { Toaster } from "react-hot-toast";
import Navbar from "../Components/NaavBar";
import React, { useEffect, useState, useCallback } from "react";
import HabitForm from "../Components/HabitForm";
import HabitTable from "../Components/HabitTable";
import { auth, database } from "../../fireBase/fireBase";
import { useAuth } from "../../Context/AurhContext";
import Progress from "../Components/MonthlyProgress";
import CalenderView from "../Components/CalendarView";
import IndividualProgress from "../Components/IndividualProgress";
import { onValue, push, ref, off, remove, set } from "firebase/database";
import { getUserProfile } from "../../fireBase/auth";
import { motion, AnimatePresence } from "framer-motion";
import ParticleField from "../Components/ParticleField";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25, mass: 1.2 },
  },
};

export default function Home() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [habitOrder, setHabitOrder] = useState(null); // persisted order
  const [createdAt, setCreatedAt] = useState(null);
  const [name, setName] = useState("");

  const totalNoofDay = () => {
    if (!createdAt) return 0;
    const currentDate = new Date();
    const createdDate = new Date(createdAt);
    const diffTime = Math.abs(currentDate - createdDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setName(profile.name);
            setCreatedAt(profile.createdAt);
          }
        } catch (error) {
          console.error("Error fetching user profile: ", error);
        }
      }
    };
    fetchUser();
  }, []);

  const addHabit = (habitName) => {
    if (!currentUser) return;
    try {
      const newHabit = { name: habitName, completed: {} };
      const habitRef = ref(database, "users/" + currentUser.uid + "/habits");
      push(habitRef, newHabit);
    } catch (error) {
      toast.error("Error adding habit.");
    }
  };

  const deleteHabit = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <p className="text-sm font-semibold text-slate-200">Delete this ritual?</p>
          <div className="flex gap-2">
            <button
              className="bg-red-500/80 hover:bg-red-500 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              onClick={() => {
                const habitRef = ref(database, `users/${currentUser.uid}/habits/${id}`);
                remove(habitRef);
                toast.dismiss(t.id);
                toast.success("Ritual removed");
              }}
            >
              Confirm
            </button>
            <button
              className="bg-slate-700/80 hover:bg-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 4000, style: { background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" } }
    );
  };

  // Load habit order from Firebase
  useEffect(() => {
    const orderRef = ref(database, `users/${currentUser.uid}/habitOrder`);
    const unsub = onValue(orderRef, (snap) => {
      const data = snap.val();
      if (data && Array.isArray(data)) {
        setHabitOrder(data);
      }
    });
    return () => off(orderRef);
  }, [currentUser]);

  // Load habits and sort by persisted order
  useEffect(() => {
    const habitRef = ref(database, `users/${currentUser.uid}/habits`);
    const unsubscribe = onValue(habitRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let loadedHabits = Object.entries(data).map(([id, habit]) => ({
          id,
          name: habit.name,
          completed: habit.completed || {},
        }));

        // Sort by persisted order if available
        if (habitOrder && habitOrder.length > 0) {
          loadedHabits.sort((a, b) => {
            const aIdx = habitOrder.indexOf(a.id);
            const bIdx = habitOrder.indexOf(b.id);
            // Items not in order go to end
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
          });
        }

        setHabits(loadedHabits);
      } else {
        setHabits([]);
      }
    });
    return () => off(habitRef);
  }, [currentUser, habitOrder]);

  // Persist reorder to Firebase
  const handleReorder = useCallback((reorderedHabits) => {
    setHabits(reorderedHabits);
    const newOrder = reorderedHabits.map(h => h.id);
    const orderRef = ref(database, `users/${currentUser.uid}/habitOrder`);
    set(orderRef, newOrder);
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 relative">
      {/* Ambient particle field — behind everything */}
      <ParticleField />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          },
        }}
      />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.header
          className="mb-14 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-linear-to-b from-blue-500 to-transparent rounded-full opacity-50" />
          <h1 className="text-4xl font-black bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tighter">
            System Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide uppercase text-[10px]">
            Consistency Protocol Active • {name || "User"}
          </p>
        </motion.header>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="lg:col-span-8 space-y-10">
            <motion.section variants={sectionVariants}>
              <div className="mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initialization</h2>
              </div>
              <div className="bg-slate-900/40 border border-white/[0.05] p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
                <HabitForm addHabit={addHabit} />
              </div>
            </motion.section>

            <motion.section variants={sectionVariants}>
              <div className="mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Matrix</h2>
              </div>
              <HabitTable
                selectedDate={selectedDate}
                habits={habits}
                deleteHabit={deleteHabit}
                onReorder={handleReorder}
              />
            </motion.section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <motion.section variants={sectionVariants}>
              <div className="mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Temporal View</h2>
              </div>
              <div className="bg-slate-900/40 border border-white/[0.05] p-6 rounded-3xl backdrop-blur-2xl shadow-2xl">
                <CalenderView
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
            </motion.section>

            <motion.div
              variants={sectionVariants}
              className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl backdrop-blur-md"
            >
              <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Operations Manual</h3>
              <ul className="text-xs text-slate-500 space-y-4 leading-relaxed font-medium">
                <li className="flex gap-3">
                  <span className="text-blue-500/40 font-bold">01</span>
                  <span>Select a calendar node to recalibrate the temporal matrix.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500/40 font-bold">02</span>
                  <span>Engage ritual cells to commit consistency data to the ledger.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500/40 font-bold">03</span>
                  <span>Drag the grip handle to reorder habits by priority.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        <motion.section
          className="mt-20 relative group"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative bg-slate-900/40 border border-white/[0.05] p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
             <div className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Analytical Overview</h2>
                <p className="text-slate-600 text-[10px] font-medium tracking-tight">Aggregated performance metrics for current period.</p>
             </div>
             <Progress habits={habits} selectedDate={selectedDate} />
          </div>
        </motion.section>

        <motion.section
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Ritual Breakdown</h2>

          {!habits.length ? (
            <div className="bg-slate-900/40 border border-white/[0.05] p-20 rounded-3xl text-center">
              <p className="text-slate-500 text-sm font-medium tracking-tight">No ritual data available in current sector.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {habits.map((habit) => (
                <motion.div key={habit.id} variants={sectionVariants}>
                  <IndividualProgress
                    habit={habit}
                    selectedDate={selectedDate}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            className="mt-20 bg-slate-900/40 border border-white/[0.05] p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
            <h1 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Accumulated Ledger</h1>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white tracking-tighter mb-1">{name}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span className="text-slate-400 text-xs font-bold tracking-widest">PROTOCOL ACTIVE</span>
              </div>
            </div>
            <div className="mt-4 px-6 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
              <p className="text-blue-400 text-xs font-black">Total Runtime: {totalNoofDay()} Cycles</p>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
