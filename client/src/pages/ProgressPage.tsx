// GymTracker — Progress Page (Charts + History)
// Design: Dark Athletic Premium | Space Grotesk + Inter | Green Neon #00FF87
// Layout: Exercise selector + line chart + history log

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Dumbbell,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  defaultWorkoutProgram,
  formatDate,
  getMuscleGroupColor,
  getProgressLogs,
  type ProgressEntry,
} from "@/lib/workoutData";

const PROGRESS_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663417068037/RxHqAgESmY5TyESbD3A4jy/gym-progress-visual-b3bEaJ6GjqhVQFj4WsWWUu.webp";

// Flatten all exercises from all days
const allExercises = defaultWorkoutProgram
  .flatMap(d => d.exercises)
  .filter((ex, idx, arr) => arr.findIndex(e => e.id === ex.id) === idx);

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    allExercises[0]?.id ?? ""
  );
  const [chartMetric, setChartMetric] = useState<"maxWeight" | "totalVolume">(
    "maxWeight"
  );

  const allLogs = getProgressLogs();

  const exerciseLogs = useMemo(
    () =>
      allLogs
        .filter(l => l.exerciseId === selectedExerciseId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [allLogs, selectedExerciseId]
  );

  const chartData = useMemo(
    () =>
      exerciseLogs.map(l => ({
        date: formatDate(l.date),
        maxWeight: l.maxWeight,
        totalVolume: l.totalVolume,
      })),
    [exerciseLogs]
  );

  const selectedExercise = allExercises.find(e => e.id === selectedExerciseId);
  const mgColor = selectedExercise
    ? getMuscleGroupColor(selectedExercise.muscleGroup)
    : "#00FF87";

  // Overall stats
  const totalWorkouts = new Set(allLogs.map(l => l.date)).size;
  const totalVolume = allLogs.reduce((a, l) => a + l.totalVolume, 0);
  const bestExercise = (() => {
    const byEx: Record<string, number> = {};
    allLogs.forEach(l => {
      byEx[l.exerciseId] = (byEx[l.exerciseId] ?? 0) + 1;
    });
    const topId = Object.entries(byEx).sort((a, b) => b[1] - a[1])[0]?.[0];
    return allExercises.find(e => e.id === topId);
  })();

  // Personal records
  const prByExercise = useMemo(() => {
    const prs: Record<string, number> = {};
    allLogs.forEach(l => {
      if (!prs[l.exerciseId] || l.maxWeight > prs[l.exerciseId]) {
        prs[l.exerciseId] = l.maxWeight;
      }
    });
    return prs;
  }, [allLogs]);

  const currentPR = prByExercise[selectedExerciseId] ?? 0;
  const lastLog = exerciseLogs[exerciseLogs.length - 1];
  const prevLog = exerciseLogs[exerciseLogs.length - 2];
  const improvement =
    lastLog && prevLog
      ? ((lastLog.maxWeight - prevLog.maxWeight) / (prevLog.maxWeight || 1)) *
        100
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF] text-[#0F172A] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#DBEAFE] px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-black text-lg text-[#0F172A]">Progressão</h1>
            <p className="text-xs text-[#64748B]">Seu histórico de treinos</p>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {/* Overall Stats */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6 pt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            icon={<Calendar size={14} />}
            label="Treinos"
            value={totalWorkouts.toString()}
            color="#2563EB"
          />
          <StatCard
            icon={<Zap size={14} />}
            label="Volume Total"
            value={
              totalVolume > 1000
                ? `${(totalVolume / 1000).toFixed(1)}k`
                : `${totalVolume}kg`
            }
            color="#1D4ED8"
          />
        </motion.div>

        {/* Exercise Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <h2 className="text-xs font-bold tracking-widest text-[#64748B] uppercase mb-3">
            Selecionar Exercício
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allExercises.map(ex => {
              const isSelected = ex.id === selectedExerciseId;
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/50 text-[#64748B] hover:bg-white"
                  }`}
                >
                  {ex.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Chart Section */}
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 rounded-2xl p-4 mb-4 shadow-md border-2 border-[#DBEAFE]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm">
                  {selectedExercise.name}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedExercise.muscleGroup}
                </p>
              </div>
              <div className="flex gap-2">
                {currentPR > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
                      PR
                    </p>
                    <p className="font-black text-base text-[#2563EB]">
                      {currentPR}kg
                    </p>
                  </div>
                )}
                {improvement !== null && (
                  <div className="text-right ml-3">
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
                      Última
                    </p>
                    <p
                      className={`font-black text-base ${improvement >= 0 ? "text-[#2563EB]" : "text-red-400"}`}
                    >
                      {improvement >= 0 ? "+" : ""}
                      {improvement.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Metric Toggle */}
            <div className="flex gap-2 mb-4">
              {(["maxWeight", "totalVolume"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    chartMetric === m
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/50 text-[#64748B] hover:bg-white"
                  }`}
                >
                  {m === "maxWeight" ? "Carga Máx." : "Volume Total"}
                </button>
              ))}
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DBEAFE" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748B", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "2px solid #DBEAFE",
                      borderRadius: 12,
                      color: "#0F172A",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      `${value}${chartMetric === "maxWeight" ? "kg" : "kg vol."}`,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartMetric}
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563EB", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-[#64748B]">
                <BarChart3 size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum dado ainda</p>
                <p className="text-xs mt-1">
                  Complete um treino para ver sua progressão
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* History Log */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xs font-bold tracking-widest text-[#64748B] uppercase mb-3">
            Histórico — {selectedExercise?.name}
          </h2>

          {exerciseLogs.length === 0 ? (
            <div className="bg-white/80 rounded-2xl p-6 text-center text-[#64748B] shadow-md border-2 border-[#DBEAFE]">
              <Dumbbell size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sem histórico para este exercício</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...exerciseLogs].reverse().map((log, idx) => (
                <LogEntry
                  key={`${log.date}-${idx}`}
                  log={log}
                  color="#2563EB"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/80 rounded-2xl p-3 text-center shadow-md border-2 border-[#DBEAFE]">
      <div
        className="flex items-center justify-center gap-1 mb-1"
        style={{ color }}
      >
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-black text-[#0F172A] text-lg leading-none">{value}</p>
    </div>
  );
}

function LogEntry({ log, color }: { log: ProgressEntry; color: string }) {
  const completedSets = log.sets.filter(s => s.completed);
  return (
    <div className="bg-white/80 rounded-xl px-4 py-3 flex items-center gap-3 shadow-md border-2 border-[#DBEAFE]">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[#0F172A] text-sm font-bold">
          {formatDate(log.date)}
        </p>
        <p className="text-[#64748B] text-xs mt-0.5">
          {completedSets.length} séries · Máx: {log.maxWeight}kg · Vol:{" "}
          {log.totalVolume}kg
        </p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {completedSets.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
              style={{ background: `${color}22`, color }}
            >
              {s.weight}kg × {s.reps}
            </span>
          ))}
          {completedSets.length > 4 && (
            <span className="text-[10px] text-[#64748B]">
              +{completedSets.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
