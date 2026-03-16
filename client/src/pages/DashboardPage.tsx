// GymTracker — Dashboard / Results Page (Interactive Static Web Page)
// Design: Dark Athletic Premium | Space Grotesk + Inter | Green Neon #00FF87
// Features: Program overview, muscle group distribution, weekly frequency chart, top exercises

import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Calendar,
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  defaultWorkoutProgram,
  formatDate,
  getCompletedWorkouts,
  getMuscleGroupColor,
  getProgressLogs,
  type MuscleGroup,
  type ProgressEntry,
} from "@/lib/workoutData";

const PROGRESS_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663417068037/RxHqAgESmY5TyESbD3A4jy/gym-progress-visual-b3bEaJ6GjqhVQFj4WsWWUu.webp";

const NEON_GREEN = "#00FF87";
const NEON_BLUE = "#00D4FF";
const NEON_ORANGE = "#FF6B35";
const NEON_PURPLE = "#A855F7";
const NEON_PINK = "#EC4899";
const NEON_YELLOW = "#FBBF24";

const CHART_COLORS = [NEON_GREEN, NEON_BLUE, NEON_ORANGE, NEON_PURPLE, NEON_PINK, NEON_YELLOW];

// Program overview data
const programData = defaultWorkoutProgram
  .filter(d => !d.isRestDay)
  .map(d => ({
    day: d.shortLabel,
    exercises: d.exercises.length,
    color: d.color,
    name: d.name,
    muscleGroups: d.muscleGroups,
  }));

// Muscle group frequency across the week
const muscleGroupFreq: Record<string, number> = {};
defaultWorkoutProgram.forEach(d => {
  if (!d.isRestDay) {
    d.muscleGroups.forEach(mg => {
      muscleGroupFreq[mg] = (muscleGroupFreq[mg] ?? 0) + 1;
    });
  }
});
const muscleGroupData = Object.entries(muscleGroupFreq)
  .filter(([mg]) => mg !== "Descanso")
  .map(([name, value]) => ({ name, value, color: getMuscleGroupColor(name as MuscleGroup) }))
  .sort((a, b) => b.value - a.value);

// Radar data for muscle balance
const radarData = muscleGroupData.map(m => ({
  subject: m.name,
  value: m.value,
  fullMark: 3,
}));

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "program">("overview");

  const allLogs = getProgressLogs();
  const completedWorkouts = getCompletedWorkouts();

  // Stats
  const totalWorkoutDays = new Set(allLogs.map(l => l.date)).size;
  const totalVolume = allLogs.reduce((a, l) => a + l.totalVolume, 0);
  const totalSetsCompleted = allLogs.reduce(
    (a, l) => a + l.sets.filter(s => s.completed).length,
    0,
  );
  const uniqueExercises = new Set(allLogs.map(l => l.exerciseId)).size;

  // Volume by exercise (top 6)
  const volumeByExercise = useMemo(() => {
    const byEx: Record<string, { volume: number; name: string; color: string }> = {};
    allLogs.forEach(l => {
      const ex = defaultWorkoutProgram.flatMap(d => d.exercises).find(e => e.id === l.exerciseId);
      if (!ex) return;
      if (!byEx[l.exerciseId]) {
        byEx[l.exerciseId] = {
          volume: 0,
          name: ex.name,
          color: getMuscleGroupColor(ex.muscleGroup),
        };
      }
      byEx[l.exerciseId].volume += l.totalVolume;
    });
    return Object.values(byEx)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  }, [allLogs]);

  // Volume over time (last 14 days)
  const volumeOverTime = useMemo(() => {
    const byDate: Record<string, number> = {};
    allLogs.forEach(l => {
      byDate[l.date] = (byDate[l.date] ?? 0) + l.totalVolume;
    });
    return Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, volume]) => ({ date: formatDate(date), volume }));
  }, [allLogs]);

  // PRs by exercise
  const prs = useMemo(() => {
    const prMap: Record<string, { name: string; weight: number; color: string }> = {};
    allLogs.forEach(l => {
      const ex = defaultWorkoutProgram.flatMap(d => d.exercises).find(e => e.id === l.exerciseId);
      if (!ex) return;
      if (!prMap[l.exerciseId] || l.maxWeight > prMap[l.exerciseId].weight) {
        prMap[l.exerciseId] = {
          name: ex.name,
          weight: l.maxWeight,
          color: getMuscleGroupColor(ex.muscleGroup),
        };
      }
    });
    return Object.values(prMap)
      .filter(p => p.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  }, [allLogs]);

  const hasData = allLogs.length > 0;

  return (
    <div className="min-h-screen bg-[#0F1117] text-white pb-10">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ minHeight: 180 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${PROGRESS_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0F1117]" />
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-semibold">Voltar</span>
        </button>
        <div className="absolute bottom-5 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-[#00FF87]" />
            <span className="text-[#00FF87] text-xs font-bold tracking-widest uppercase">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Resultados & Análise</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Visualize seu progresso e programa de treinos
          </p>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#1A1D27] rounded-2xl p-1 mb-6">
          {(["overview", "progress", "program"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                activeTab === tab ? "bg-[#00FF87] text-black" : "text-gray-500 hover:text-white"
              }`}
            >
              {tab === "overview" ? "Visão Geral" : tab === "progress" ? "Progresso" : "Programa"}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="overview">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <BigStatCard
                icon={<Calendar size={18} />}
                label="Dias Treinados"
                value={totalWorkoutDays.toString()}
                sub="sessões registradas"
                color={NEON_GREEN}
              />
              <BigStatCard
                icon={<Zap size={18} />}
                label="Volume Total"
                value={
                  totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`
                }
                sub="carga movimentada"
                color={NEON_BLUE}
              />
              <BigStatCard
                icon={<Activity size={18} />}
                label="Séries Feitas"
                value={totalSetsCompleted.toString()}
                sub="séries completadas"
                color={NEON_ORANGE}
              />
              <BigStatCard
                icon={<Dumbbell size={18} />}
                label="Exercícios"
                value={uniqueExercises.toString()}
                sub="exercícios diferentes"
                color={NEON_PURPLE}
              />
            </div>

            {/* Muscle Group Distribution */}
            <SectionTitle title="Distribuição Muscular" icon={<Target size={14} />} />
            <div className="bg-[#1A1D27] rounded-2xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-3">Grupos musculares no programa semanal</p>
              <div className="flex gap-4 items-center">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={muscleGroupData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1A1D27",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#fff",
                        fontSize: 11,
                      }}
                      formatter={(value: number) => [`${value}x/semana`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {muscleGroupData.map(m => (
                    <div key={m.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: m.color }}
                      />
                      <span className="text-xs text-gray-300 flex-1">{m.name}</span>
                      <span className="text-xs font-bold" style={{ color: m.color }}>
                        {m.value}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Muscle Balance Radar */}
            <SectionTitle title="Equilíbrio Muscular" icon={<Activity size={14} />} />
            <div className="bg-[#1A1D27] rounded-2xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-3">Frequência de treino por grupo muscular</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280", fontSize: 10 }} />
                  <Radar
                    name="Frequência"
                    dataKey="value"
                    stroke={NEON_GREEN}
                    fill={NEON_GREEN}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1D27",
                      border: "1px solid rgba(0,255,135,0.2)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 11,
                    }}
                    formatter={(value: number) => [`${value}x/semana`, "Frequência"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ===== PROGRESS TAB ===== */}
        {activeTab === "progress" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="progress">
            {!hasData ? (
              <EmptyState />
            ) : (
              <>
                {/* Volume Over Time */}
                <SectionTitle title="Volume ao Longo do Tempo" icon={<TrendingUp size={14} />} />
                <div className="bg-[#1A1D27] rounded-2xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Volume total (kg) por sessão de treino
                  </p>
                  {volumeOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={volumeOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#6B7280", fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fill: "#6B7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1A1D27",
                            border: `1px solid ${NEON_GREEN}44`,
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 11,
                          }}
                          formatter={(v: number) => [`${v}kg`, "Volume"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="volume"
                          stroke={NEON_GREEN}
                          strokeWidth={2.5}
                          dot={{ fill: NEON_GREEN, r: 3, strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart />
                  )}
                </div>

                {/* Volume by Exercise */}
                <SectionTitle title="Volume por Exercício" icon={<BarChart3 size={14} />} />
                <div className="bg-[#1A1D27] rounded-2xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-3">Top exercícios por volume acumulado</p>
                  {volumeByExercise.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={volumeByExercise} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#ffffff08"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "#6B7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: "#9CA3AF", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={90}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#1A1D27",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 11,
                          }}
                          formatter={(v: number) => [`${v}kg`, "Volume"]}
                        />
                        <Bar dataKey="volume" radius={[0, 6, 6, 0]}>
                          {volumeByExercise.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart />
                  )}
                </div>

                {/* Personal Records */}
                {prs.length > 0 && (
                  <>
                    <SectionTitle title="Recordes Pessoais" icon={<Trophy size={14} />} />
                    <div className="space-y-2 mb-4">
                      {prs.map((pr, idx) => (
                        <motion.div
                          key={pr.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="bg-[#1A1D27] rounded-xl px-4 py-3 flex items-center gap-3"
                        >
                          <span className="text-lg font-black text-gray-700 w-6 text-center">
                            {idx + 1}
                          </span>
                          <div
                            className="w-2 h-8 rounded-full flex-shrink-0"
                            style={{ background: pr.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate">{pr.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg" style={{ color: pr.color }}>
                              {pr.weight}kg
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ===== PROGRAM TAB ===== */}
        {activeTab === "program" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="program">
            {/* Weekly Program Overview */}
            <SectionTitle title="Exercícios por Dia" icon={<Calendar size={14} />} />
            <div className="bg-[#1A1D27] rounded-2xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-3">
                Quantidade de exercícios por dia da semana
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={programData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={20}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1D27",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 11,
                    }}
                    formatter={(v: number, _: string, props: { payload?: { name: string } }) => [
                      `${v} exercícios`,
                      props?.payload?.name ?? "",
                    ]}
                  />
                  <Bar dataKey="exercises" radius={[6, 6, 0, 0]}>
                    {programData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Day-by-day breakdown */}
            <SectionTitle title="Detalhes por Dia" icon={<Dumbbell size={14} />} />
            <div className="space-y-3">
              {defaultWorkoutProgram
                .filter(d => !d.isRestDay)
                .map((day, idx) => (
                  <motion.div
                    key={day.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="bg-[#1A1D27] rounded-2xl overflow-hidden"
                  >
                    <div className="h-1" style={{ background: day.color }} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span
                            className="text-xs font-black tracking-widest"
                            style={{ color: day.color }}
                          >
                            {day.shortLabel}
                          </span>
                          <h3 className="text-white font-bold text-sm">{day.name}</h3>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: `${day.color}22`, color: day.color }}
                        >
                          {day.exercises.length} exerc.
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {day.exercises.map(ex => (
                          <div key={ex.id} className="flex items-center gap-2">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: getMuscleGroupColor(ex.muscleGroup) }}
                            />
                            <span className="text-gray-300 text-xs flex-1">{ex.name}</span>
                            <span className="text-gray-600 text-xs">
                              {ex.defaultSets}×{ex.defaultReps}
                              {ex.defaultWeight > 0 ? ` · ${ex.defaultWeight}kg` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Rest day note */}
            <div className="mt-4 bg-[#1A1D27] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Domingo
                </span>
              </div>
              <p className="text-gray-400 text-sm font-semibold">Descanso & Recuperação</p>
              <p className="text-gray-600 text-xs mt-1">
                Recuperação ativa: caminhada leve, alongamento ou mobilidade.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-gray-400">
      {icon}
      <h2 className="text-xs font-bold tracking-widest uppercase">{title}</h2>
    </div>
  );
}

function BigStatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-[#1A1D27] rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white font-black text-2xl leading-none">{value}</p>
      <p className="text-gray-600 text-[10px] mt-1">{sub}</p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart3 size={48} className="text-gray-700 mb-4" />
      <h3 className="text-white font-bold text-lg mb-2">Sem dados ainda</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Complete seu primeiro treino para ver gráficos e análises de progressão aqui.
      </p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
      Nenhum dado registrado ainda
    </div>
  );
}
