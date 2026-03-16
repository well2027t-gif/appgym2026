// GymTracker — Home Page
// Design: Clean, professional interface with smooth modal interactions

import { motion } from "framer-motion";
import { Bolt, Check, Dumbbell, Flame, Gift, ImageIcon, Scale, Trophy } from "lucide-react";
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
import { useTheme } from "@/contexts/ThemeContext";

const PAGE_BG =
  "https://images.unsplash.com/photo-1526402461234-4f3a3e11b3c9?auto=format&fit=crop&w=1400&q=60";
const HERO_BG =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=60";
const EVO_WEIGHT_IMG =
  "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=600&q=60";
const EVO_LAST_PHOTO_IMG = "/welington-last-photo.png";
const DEFAULT_PROFILE_PHOTO = "/welington-profile.png";

type UserProfile = {
  name?: string;
  weight?: number;
  goal?: string;
  photoDataUrl?: string;
  progressPhotos?: string[];
};

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";

function getShortDowLabel(dow: number) {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][dow] ?? "";
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { colorTheme } = useTheme();
  const todayDOW = getTodayDayOfWeek();
  const todayISO = getTodayISO();

  const program = getActiveWorkoutProgram();

  // Order: Monday to Sunday
  const orderedDays = [1, 2, 3, 4, 5, 6, 0]
    .map(dow => program.find(d => d.dayOfWeek === dow))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const todayDay = orderedDays.find(d => d.dayOfWeek === todayDOW) ?? orderedDays[0];
  const nextWorkoutDay = useMemo(() => {
    const startIdx = orderedDays.findIndex(d => d.dayOfWeek === todayDOW);
    const begin = startIdx >= 0 ? startIdx : 0;
    for (let i = 0; i < orderedDays.length; i++) {
      const day = orderedDays[(begin + i) % orderedDays.length];
      if (!day.isRestDay) return day;
    }
    return orderedDays[begin];
  }, [orderedDays, todayDOW]);

  const headlineWorkoutName = useMemo(() => {
    // Ajuste temporário solicitado: segunda-feira como Peito + Tríceps.
    if (nextWorkoutDay.dayOfWeek === 1) return "Peito + Tríceps";
    return nextWorkoutDay.name;
  }, [nextWorkoutDay.dayOfWeek, nextWorkoutDay.name]);

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

  const latestProgressPhoto =
    profile?.progressPhotos && profile.progressPhotos.length > 0
      ? profile.progressPhotos[0]
      : EVO_LAST_PHOTO_IMG;

  const stats = useMemo(() => {
    const workoutDaysInWeek = orderedDays.filter(d => !d.isRestDay).length;
    const totalMinutes = new Set(logs.map(l => l.date)).size * 40;

    const uniqueDates = Array.from(
      new Set(completedWorkouts.map(k => k.split("_").slice(1).join("_"))),
    )
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

  const weekDateByDow = useMemo(() => {
    const today = new Date();
    const map: Record<number, number> = {};

    [1, 2, 3, 4, 5, 6, 0].forEach(dow => {
      const date = new Date(today);
      const diff = dow - todayDOW;
      date.setDate(today.getDate() + diff);
      map[dow] = date.getDate();
    });

    return map;
  }, [todayDOW]);

  return (
    <div
      className="min-h-dvh overflow-x-hidden text-[#0F172A]"
      style={{
        backgroundImage:
          colorTheme === "pink"
            ? `linear-gradient(180deg, rgba(255,249,252,0.96), rgba(255,228,244,0.96)), url(${PAGE_BG})`
            : `linear-gradient(180deg, rgba(255,255,255,0.92), rgba(226,239,255,0.96)), url(${PAGE_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="px-4 max-w-[420px] mx-auto pt-2 pb-[calc(14rem+env(safe-area-inset-bottom))]">
          {/* Top brand / greeting card */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-2"
          >
            <div className="absolute inset-x-6 -top-2 h-6 rounded-full bg-gradient-to-r from-[#DBEAFE] to-transparent blur-xl opacity-70" />
            <div className="relative flex items-center gap-3.5 rounded-2xl bg-white/95 border border-[#DBEAFE] shadow px-3 py-2.5">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-full bg-white border border-[#DBEAFE] flex items-center justify-center shadow-md">
                  <img
                    src={profile?.photoDataUrl || DEFAULT_PROFILE_PHOTO}
                    alt="Foto do perfil"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 pl-0.5">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.18em]">
                  Seu coach diário
                </p>
                <p className="text-[13px] font-black text-[#0F172A] truncate">
                  Bom dia,{" "}
                  {profile?.name && profile.name.trim().length > 0 ? profile.name : "Welington"} 💪
                </p>
                <p className="text-[10px] text-[#1E3A8A] mt-1 leading-tight">
                  <Flame size={12} className="inline-block mr-1 text-[#2563EB]" />
                  Treino de hoje:{" "}
                  <span className="font-bold text-[#1D4ED8] underline decoration-[#1D4ED8]/40">
                    {headlineWorkoutName}
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
            className="mt-2 rounded-3xl overflow-hidden shadow-2xl border border-white/30"
          >
            <div
              className="relative h-[76px]"
              style={{
                backgroundImage:
                  colorTheme === "pink"
                    ? `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(236,72,153,0.40)), url(${HERO_BG})`
                    : `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(37,99,235,0.40)), url(${HERO_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 p-3 flex items-end">
                <p className="text-white text-[15px] font-black leading-snug drop-shadow">
                  Disciplina
                  <br />
                  constrói resultados.
                </p>
              </div>
            </div>

            <div
              className="px-3.5 py-2 text-white"
              style={{
                background:
                  colorTheme === "pink"
                    ? "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(157,23,77,0.95))"
                    : "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.92))",
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
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
              <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] font-bold text-white/90">
                <Trophy size={14} className="text-[#93C5FD]" />
                <span>
                  Sequência: <span className="font-black">{stats.streak}</span> Dias
                </span>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setLocation("/conquistas")}
            className="mt-2 w-full rounded-2xl border border-[#DBEAFE] bg-white/95 p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] text-left"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-[#1D4ED8]">
                  Novo painel
                </p>
                <p className="text-[14px] font-black text-[#0F172A]">
                  Conquistas e recompensas
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Metas, desafios, consistência e prêmios reais.
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#1D4ED8] grid place-items-center shrink-0">
                <Gift size={18} />
              </div>
            </div>
          </motion.button>

          {/* Start workout */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation(`/workout/${nextWorkoutDay.id}`)}
            className="mt-2 w-full py-2.5 rounded-full text-white font-black tracking-wide text-[14px] transition-all"
            style={{
              background:
                colorTheme === "pink"
                  ? "linear-gradient(135deg, #EC4899, #DB2777)"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              boxShadow:
                colorTheme === "pink"
                  ? "0 16px 26px rgba(236, 72, 153, 0.45)"
                  : "0 16px 26px rgba(37, 99, 235, 0.45)",
            }}
          >
            INICIAR TREINO
          </motion.button>

          {/* Week selector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-2 bg-white/90 backdrop-blur-md rounded-3xl px-3.5 pt-2 pb-2 border border-[#DBEAFE] shadow-[0_12px_26px_rgba(37,99,235,0.12)] overflow-hidden relative"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#93C5FD] via-[#2563EB] to-[#1D4ED8]" />
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8]">
                Semana
              </p>
              <span className="rounded-full bg-[#EFF6FF] border border-[#DBEAFE] px-2 py-0.5 text-[9px] font-bold text-[#1E3A8A]">
                toque no dia
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map(dow => {
                const day = orderedDays.find(d => d.dayOfWeek === dow);
                if (!day) return <div key={dow} />;
                const done = isWorkoutCompleted(day.id, todayISO);
                const active = dow === todayDay.dayOfWeek;
                return (
                  <button
                    key={dow}
                    onClick={() => setLocation(`/workout/${day.id}`)}
                    className={`flex min-h-[42px] flex-col items-center justify-center rounded-2xl border px-1 py-1 transition-all ${
                      active
                        ? "border-[#93C5FD] bg-[#EFF6FF]"
                        : "border-[#DBEAFE] bg-white/70 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`text-[9px] font-black ${active ? "text-[#1D4ED8]" : "text-[#1E3A8A]"}`}
                    >
                      {getShortDowLabel(dow)}
                    </span>
                    <span
                      className={`text-[12px] font-black leading-none ${active ? "text-[#0F172A]" : "text-[#334155]"}`}
                    >
                      {weekDateByDow[dow]}
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
            className="mt-2"
          >
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-[15px] font-black text-[#0F172A]">Sua Evolução</p>
                <p className="text-[10px] text-[#64748B]">Indicadores principais</p>
              </div>
              <span className="rounded-full border border-[#DBEAFE] bg-white/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#1D4ED8]">
                premium
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-[22px] border border-[#DBEAFE] bg-white p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] min-h-[108px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Peso Atual
                  </span>
                  <Scale size={14} className="text-[#1D4ED8]" />
                </div>
                <p className="text-[32px] leading-none font-black text-[#0F172A]">
                  {profile?.weight && profile.weight > 0 ? profile.weight : 94}
                </p>
                <p className="text-[11px] font-bold text-[#1E3A8A]">kg</p>
                <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                  +2 kg no mês
                </div>
              </div>

              <div className="rounded-[22px] border border-[#DBEAFE] bg-white p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] min-h-[108px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Treinos
                  </span>
                  <Dumbbell size={14} className="text-[#1D4ED8]" />
                </div>
                <p className="text-[32px] leading-none font-black text-[#0F172A] text-center mt-1">
                  {new Set(logs.map(l => l.date)).size}
                </p>
                <p className="text-[11px] font-bold text-[#1E3A8A] text-center mt-1">Concluídos</p>
                <div className="mt-2 text-[10px] text-[#64748B] font-semibold text-center">
                  consistência
                </div>
              </div>

              <div className="rounded-[22px] border border-[#DBEAFE] bg-white p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] min-h-[108px]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Última Foto
                  </span>
                  <ImageIcon size={14} className="text-[#1D4ED8]" />
                </div>
                <div
                  className="h-[62px] w-full rounded-[16px] border border-[#DBEAFE] overflow-hidden"
                  style={{
                    backgroundImage: `url(${latestProgressPhoto})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </div>
          </motion.div>

      </div>

      <BottomNav />
    </div>
  );
}
