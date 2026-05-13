import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function IndividualProgress({ habit, selectedDate }) {
  if (!habit) return null;

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split("T")[0];
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dataPoints = labels.map((day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr > today) return null;
    return habit.completed?.[dateStr] ? 1 : 0;
  });

  const validDays = dataPoints.filter((v) => v !== null);
  const successCount = validDays.filter((v) => v === 1).length;
  const successRate = validDays.length ? ((successCount / validDays.length) * 100).toFixed(1) : 0;

  const chartData = {
    labels,
    datasets: [
      {
        data: dataPoints,
        backgroundColor: (context) => {
          const value = context.raw;
          if (value === null) return "rgba(30, 41, 59, 0.1)";
          return value === 1 ? "rgba(16, 185, 129, 0.8)" : "rgba(244, 63, 94, 0.1)";
        },
        hoverBackgroundColor: "rgba(16, 185, 129, 1)",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#94a3b8",
        bodyColor: "#f1f5f9",
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => ctx.raw === 1 ? "✔ COMPLETED" : ctx.raw === 0 ? "✖ MISSED" : "PENDING",
        },
      },
    },
    scales: {
      y: { display: false, max: 1.5 },
      x: {
        grid: { display: false },
        ticks: { color: "#475569", font: { size: 9, weight: "700" } },
      },
    },
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative bg-slate-900/40 border border-white/[0.05] p-8 rounded-[2rem] backdrop-blur-2xl shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-end justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors duration-500">
            {habit.name}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            Signal Continuity
          </p>
        </div>

        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Ratio</span>
          </div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black text-white tracking-tighter">{successRate}</span>
            <span className="text-xs font-bold text-slate-500">%</span>
          </div>
        </div>
      </div>

      <div className="h-32 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/20 pointer-events-none rounded-xl" />
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
}
