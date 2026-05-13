import { useAuth } from '../../Context/AurhContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { signOutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success("Successfully signed out!");
    } catch (e) {
      console.log(e);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-slate-950/80 backdrop-blur-2xl"
    >
      {/* Orbital indicator — traces along bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-white/[0.03] overflow-hidden">
        <motion.div
          className="w-12 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent"
          animate={{ x: ["-48px", "calc(100vw + 48px)"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo with heartbeat pulse */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <motion.div
            className="relative bg-linear-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20"
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 4px 12px rgba(59,130,246,0.2)",
                "0 4px 20px rgba(59,130,246,0.4)",
                "0 4px 12px rgba(59,130,246,0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-white w-4 h-4" />
          </motion.div>

          <div>
            <h1 className="text-white font-black text-lg tracking-tighter leading-none">
              Habit<span className="text-blue-400">Tracker</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Online</span>
            </div>
          </div>
        </motion.div>

        {/* Sign-out with magnetic hover */}
        <motion.button
          onClick={handleLogout}
          whileHover={{
            y: -2,
            boxShadow: "0 8px 20px rgba(239, 68, 68, 0.15)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="flex items-center gap-2.5 text-slate-400 hover:text-red-400 text-sm font-bold px-4 py-2 rounded-xl border border-transparent hover:border-red-500/20 transition-colors duration-300"
        >
          <span className="tracking-tight">Sign Out</span>
          <motion.div
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 600, damping: 15 }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
          </motion.div>
        </motion.button>
      </div>
    </motion.nav>
  );
}