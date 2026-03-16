// GymTracker — Home Page
// Design: Clean, professional interface with smooth modal interactions

import { motion } from "framer-motion";
import { Bolt, Check, Dumbbell, Flame, ImageIcon, Scale, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";
import {
  getActiveWorkoutProgram,
  getTodayDayOfWeek,
  getTodayISO,
  getCompletedWorkouts,
  getProgressLogs,
  isWorkoutCompleted,
} from "@/lib/workoutData";
import BottomNav from "@/components/BottomNav";
import CoachTaiWidget from "@/components/CoachTaiWidget";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663417482339/8T8LQictkiAYW4kTBqUo49/tai-strong-logo_138df1fb.png";
const PAGE_BG =
  "https://images.unsplash.com/photo-1526402461234-4f3a3e11b3c9?auto=format&fit=crop&w=1400&q=60";
const HERO_BG =
  "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=1400&q=60";
const EVO_WEIGHT_IMG =
  "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=600&q=60";
const EVO_LAST_PHOTO_IMG =
  "https://images.unsplash.com/photo-1526401485004-2aa7b6f2b59b?auto=format&fit=crop&w=600&q=60";

type UserProfile = {
  name?: string;
  weight?: number;
  goal?: string;
};

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";

function getShortDowLabel(dow: number) {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][dow] ?? "";
}

export default function Home() {
  const [, setLocation] = useLocation();
  const todayDOW = getTodayDayOfWeek();
  const todayISO = getTodayISO();

  const program = getActiveWorkoutProgram();

  // Order: Monday to Sunday
  const orderedDays = [1, 2, 3, 4, 5, 6, 0]
    .map((dow) => program.find((d) => d.dayOfWeek === dow))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const todayDay = orderedDays.find((d) => d.dayOfWeek === todayDOW) ?? orderedDays[0];
  const nextWorkoutDay = useMemo(() => {
    const startIdx = orderedDays.findIndex((d) => d.dayOfWeek === todayDOW);
    const begin = startIdx >= 0 ? startIdx : 0;
    for (let i = 0; i < orderedDays.length; i++) {
      const day = orderedDays[(begin + i) % orderedDays.length];
      if (!day.isRestDay) return day;
    }
    return orderedDays[begin];
  }, [orderedDays, todayDOW]);

  const completed = isWorkoutCompleted(nextWorkoutDay.id, todayISO);
  const completedWorkouts = getCompletedWorkouts();
  const logs = getProgressLogs();

  let profile: UserProfile | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      profile = raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      profile = null;
    }
  }

  const stats = useMemo(() => {
    const workoutDaysInWeek = orderedDays.filter((d) => !d.isRestDay).length;
    const totalMinutes = new Set(logs.map((l) => l.date)).size * 40;

    const uniqueDates = Array.from(new Set(completedWorkouts.map((k) => k.split("_").slice(1).join("_"))))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));

    let streak = 0;
    if (uniqueDates.length > 0) {
      const start = uniqueDates[0] === todayISO ? todayISO : uniqueDates[0];
      const startDate = new Date(start + "T00:00:00");
      const set = new Set(uniqueDates);
      for (let i = 0; i < 365; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        if (!set.has(iso)) break;
        streak++;
      }
    }

    return { workoutDaysInWeek, totalMinutes, streak };
  }, [orderedDays, logs, completedWorkouts, todayISO]);

  return (
    <div
      className="min-h-screen text-[#0F172A] pb-20"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.92), rgba(226,239,255,0.96)), url(${PAGE_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="px-4 max-w-[420px] mx-auto pt-4">
        {/* Top brand / greeting card */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-3"
        >
          <div className="absolute inset-x-6 -top-2 h-6 rounded-full bg-gradient-to-r from-[#DBEAFE] to-transparent blur-xl opacity-70" />
          <div className="relative flex items-center gap-3 rounded-2xl bg-white/95 border border-[#DBEAFE] shadow px-3 py-2.5">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-md">
                <img
                  src={LOGO_URL}
                  alt="TAI STRONG"
                  className="w-8 h-8 rounded-full border border-white/70 bg-white object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.18em]">
                Seu coach diário
              </p>
              <p className="text-[13px] font-black text-[#0F172A] truncate">
                Bom dia, {profile?.name && profile.name.trim().length > 0 ? profile.name : "Ana"} 💪
              </p>
              <p className="text-[11px] text-[#1E3A8A] mt-0.5 leading-tight">
                <Flame size={12} className="inline-block mr-1 text-[#2563EB]" />
                Treino de hoje:{" "}
                <span className="font-bold text-[#1D4ED8] underline decoration-[#1D4ED8]/40">
                  {nextWorkoutDay.name}
                </span>
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] whitespace-nowrap">
                Nível focado
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold whitespace-nowrap">
                Dia {todayDay.shortLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 rounded-3xl overflow-hidden shadow-2xl border border-white/30"
        >
          <div
            className="relative h-[104px]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(37,99,235,0.40)), url(${HERO_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 p-4 flex items-end">
              <p className="text-white text-lg font-black leading-snug drop-shadow">
                Disciplina
                <br />
                constrói resultados.
              </p>
            </div>
          </div>

          <div
            className="px-4 py-3 text-white"
            style={{
              background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.92))",
            }}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-[#FCD34D]" />
                <span>
                  <span className="font-black">{stats.workoutDaysInWeek}</span> Treinos na Semana
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bolt size={14} className="text-[#60A5FA]" />
                <span>
                  <span className="font-black">{stats.totalMinutes}</span> Min Treinados
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-white/90">
              <Trophy size={14} className="text-[#93C5FD]" />
              <span>
                Sequência: <span className="font-black">{stats.streak}</span> Dias
              </span>
            </div>
          </div>
        </motion.div>

        {/* Start workout */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation(`/workout/${nextWorkoutDay.id}`)}
          className="mt-3 w-full py-3.5 rounded-full text-white font-black tracking-wide text-[15px] transition-all"
          style={{
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            boxShadow: "0 16px 26px rgba(37, 99, 235, 0.45)",
          }}
        >
          INICIAR TREINO
        </motion.button>

        {/* Week selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-3 bg-white/80 backdrop-blur-md rounded-3xl px-4 pt-2.5 pb-3.5 border border-white/60 shadow-lg"
        >
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
              const day = orderedDays.find((d) => d.dayOfWeek === dow);
              if (!day) return <div key={dow} />;
              const done = isWorkoutCompleted(day.id, todayISO);
              const active = dow === todayDay.dayOfWeek;
              return (
                <button
                  key={dow}
                  onClick={() => setLocation(`/workout/${day.id}`)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-[11px] font-black text-[#1E3A8A]">{getShortDowLabel(dow)}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center">
                    {done ? (
                      <span className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center shadow-sm">
                        <Check size={16} className="text-white" />
                      </span>
                    ) : (
                      <span
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                          active ? "border-[#2563EB]" : "border-[#BFDBFE]"
                        }`}
                        style={
                          active
                            ? { background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(59,130,246,0.12))" }
                            : { background: "rgba(255,255,255,0.7)" }
                        }
                      >
                        <span className="text-[#BFDBFE] text-sm leading-none">○</span>
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-4"
        >
          <div className="mb-2">
            <p className="text-base font-black text-[#0F172A]">Sua Evolução</p>
            <p className="text-[11px] text-[#64748B]">Acompanhe seus indicadores principais</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-[#DBEAFE] bg-white/95 p-3 shadow-[0_14px_30px_rgba(37,99,235,0.10)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">
                  Peso Atual
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                  <Scale size={15} className="text-[#1D4ED8]" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-3xl font-black leading-none text-[#0F172A]">
                    {profile?.weight && profile.weight > 0 ? profile.weight : 64}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-[#1E3A8A]">kg</p>
                  <p className="mt-2 text-[11px] font-bold text-emerald-600">+ 2 kg este mes</p>
                </div>
                <div
                  className="h-14 w-14 rounded-2xl border border-[#DBEAFE] shadow-inner"
                  style={{
                    backgroundImage: `url(${EVO_WEIGHT_IMG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[#DBEAFE] bg-white/95 p-3 shadow-[0_14px_30px_rgba(37,99,235,0.10)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">
                  Treinos
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                  <Dumbbell size={15} className="text-[#1D4ED8]" />
                </span>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black leading-none text-[#0F172A]">
                  {new Set(logs.map((l) => l.date)).size}
                </p>
                <p className="mt-1 text-[12px] font-bold text-[#1E3A8A]">Concluidos</p>
                <div className="mt-3 rounded-2xl bg-[#F8FBFF] px-2 py-2 text-[10px] font-bold text-[#64748B]">
                  Consistencia semanal
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#DBEAFE] bg-white/95 p-3 shadow-[0_14px_30px_rgba(37,99,235,0.10)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">
                  Ultima Foto
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                  <ImageIcon size={15} className="text-[#1D4ED8]" />
                </span>
              </div>
              <div
                className="h-[106px] w-full rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF]"
                style={{
                  backgroundImage: `url(${EVO_LAST_PHOTO_IMG})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>
        </motion.div>

      </div>

      <CoachTaiWidget
        profileName={profile?.name}
        workoutName={nextWorkoutDay.name}
        completedToday={completed}
        weeklyWorkoutCount={stats.workoutDaysInWeek}
      />
      <BottomNav />
    </div>
  );
}
