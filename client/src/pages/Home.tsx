// GymTracker — Home Page
// Design: Clean, professional interface with smooth modal interactions

import { motion } from "framer-motion";
import { Activity, Bolt, ChevronLeft, ChevronRight, Dumbbell, Flame, ImageIcon, Scale, Timer, Trophy, X } from "lucide-react";
import { useMemo, useState } from "react";
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
  "https://images.unsplash.com/photo-1609674248079-e9242e48c06b?auto=format&fit=crop&w=1400&q=60";
const EVO_WEIGHT_IMG =
  "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=600&q=60";
const EVO_LAST_PHOTO_IMG = "/welington-last-photo.png";
const DEFAULT_PROFILE_PHOTO = "/welington-profile.png";

type UserProfile = {
  name?: string;
  weight?: number;
  goal?: string;
  photoDataUrl?: string;
  progressPhotos?: Array<string | { url: string; uploadedAt?: string }>;
};

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";

function getShortDowLabel(dow: number) {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"][dow] ?? "";
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { colorTheme } = useTheme();
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
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
      ? typeof profile.progressPhotos[0] === "string"
        ? profile.progressPhotos[0]
        : profile.progressPhotos[0]?.url
      : EVO_LAST_PHOTO_IMG;
  const galleryPhotos = useMemo(() => {
    const raw = profile?.progressPhotos;
    if (!raw || raw.length === 0) {
      return [{ url: latestProgressPhoto, uploadedAt: todayISO }];
    }

    return raw
      .map((item, index) => {
        if (typeof item === "string") {
          const d = new Date();
          d.setDate(d.getDate() - index * 7);
          return {
            url: item,
            uploadedAt: d.toISOString().slice(0, 10),
          };
        }
        return {
          url: item.url,
          uploadedAt: item.uploadedAt ?? todayISO,
        };
      })
      .filter(item => Boolean(item.url));
  }, [profile?.progressPhotos, latestProgressPhoto, todayISO]);

  const selectedPhotoMeta = galleryPhotos[photoIndex] ?? galleryPhotos[0];
  const selectedPhotoDate = selectedPhotoMeta?.uploadedAt ?? todayISO;

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
  const completedTrainingsCount = useMemo(() => new Set(logs.map(l => l.date)).size, [logs]);

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
      <div className="px-4 max-w-[420px] mx-auto pt-1.5 pb-[calc(11.5rem+env(safe-area-inset-bottom))]">
          {/* Top brand / greeting card */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-1.5 -mx-3"
          >
            <div className="absolute inset-x-6 -top-2 h-6 rounded-full bg-gradient-to-r from-[#DBEAFE] to-transparent blur-xl opacity-70" />
            <div className="relative flex items-center gap-3 rounded-2xl bg-white/95 border border-[#DBEAFE] shadow px-3 py-2">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-white border border-[#DBEAFE] flex items-center justify-center shadow-md">
                  <img
                    src={profile?.photoDataUrl || DEFAULT_PROFILE_PHOTO}
                    alt="Foto do perfil"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 pl-0.5">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.18em]">
                  Seu coach diário
                </p>
                <p className="text-[12px] font-black text-[#0F172A] truncate">
                  Bom dia,{" "}
                  {profile?.name && profile.name.trim().length > 0 ? profile.name : "Welington"} 💪
                </p>
                <p className="text-[9px] text-[#1E3A8A] mt-0.5 leading-tight">
                  <Flame size={12} className="inline-block mr-1 text-[#2563EB]" />
                  Treino de hoje:{" "}
                  <span className="font-bold text-[#1D4ED8] underline decoration-[#1D4ED8]/40">
                    {headlineWorkoutName}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black whitespace-nowrap border"
                  style={{
                    background: colorTheme === "pink"
                      ? "linear-gradient(135deg, #FCE7F3, #FBCFE8)"
                      : "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
                    borderColor: colorTheme === "pink" ? "#F9A8D4" : "#93C5FD",
                    color: colorTheme === "pink" ? "#BE185D" : "#1D4ED8",
                  }}
                >
                  ⭐ Premium
                </span>
              </div>
            </div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-1.5 rounded-3xl overflow-hidden border border-white/40 shadow-[0_14px_28px_rgba(15,23,42,0.22)]"
          >
            <div
              className="relative h-[88px]"
              style={{
                backgroundImage:
                  colorTheme === "pink"
                    ? `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(236,72,153,0.40)), url(${HERO_BG})`
                    : `linear-gradient(135deg, rgba(15,23,42,0.70), rgba(37,99,235,0.40)), url(${HERO_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center 35%",
              }}
            >
              <div className="absolute inset-0">
                <div className="absolute -left-6 -top-10 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute right-3 top-3 rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur">
                  PLANO DO DIA
                </div>
                <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-white text-[13px] font-black leading-snug drop-shadow">
                      Disciplina constrói resultados
                    </p>
                    <p className="mt-1 text-[9px] font-semibold text-white/90 drop-shadow-sm">
                      Hoje: <span className="underline decoration-white/40">{headlineWorkoutName}</span>
                    </p>
                  </div>
                  <div className="hidden xs:flex flex-col items-end gap-1 text-[9px] text-white/90">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 border border-white/25">
                      <Flame size={11} className="text-[#FBBF24]" />
                      <span className="font-bold">{stats.workoutDaysInWeek}x / semana</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 border border-white/10">
                      <Trophy size={11} className="text-[#BFDBFE]" />
                      <span className="font-semibold">{stats.streak} dias de sequência</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="px-3 py-2 text-white"
              style={{
                background:
                  colorTheme === "pink"
                    ? "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(157,23,77,0.95))"
                    : "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.92))",
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-[#FCD34D]" />
                  <span>
                    <span className="font-black">{stats.workoutDaysInWeek}</span> Treinos na Semana
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
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
                    className={`flex min-h-[44px] flex-col items-center justify-center rounded-2xl border px-1 py-1 transition-all ${
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
            </div>

            {/* Grid: 2 cols left (Peso + Treinos + Atividade), 1 col right (Foto tall) */}
            <div className="grid grid-cols-3 gap-1.5" style={{ gridTemplateRows: "auto auto" }}>

              {/* Peso Atual — row 1, col 1 */}
              <div className="h-[112px] rounded-[22px] border border-[#DBEAFE] bg-white p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Peso Atual
                  </span>
                  <Scale size={14} className="text-[#1D4ED8]" />
                </div>
                <p className="text-[32px] leading-none font-black text-[#0F172A]">
                  {profile?.weight && profile.weight > 0 ? profile.weight : 94}
                  <span className="ml-1 text-[14px] font-bold text-[#1E3A8A]">kg</span>
                </p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#64748B]">Meta: 100 kg</span>
                    <span className="text-[9px] font-black text-[#1D4ED8]">
                      {Math.round(((profile?.weight ?? 94) / 100) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EFF6FF] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#3B82F6] to-[#1D4ED8]"
                      style={{ width: `${Math.min(100, Math.round(((profile?.weight ?? 94) / 100) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Treinos — row 1, col 2 */}
              <div className="h-[112px] rounded-[22px] border border-[#DBEAFE] bg-white p-2.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Treinos
                  </span>
                  <Dumbbell size={14} className="text-[#1D4ED8]" />
                </div>
                <p className="text-[32px] leading-none font-black text-[#0F172A] text-center mt-1">
                  {completedTrainingsCount}
                </p>
                <p className="text-[11px] font-bold text-[#1E3A8A] text-center mt-1">Concluídos</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#64748B]">Semana</span>
                    <span className="text-[9px] font-black text-[#1D4ED8]">
                      {Math.min(completedTrainingsCount, stats.workoutDaysInWeek)}/{stats.workoutDaysInWeek}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: stats.workoutDaysInWeek }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full"
                        style={{
                          background: i < Math.min(completedTrainingsCount, stats.workoutDaysInWeek)
                            ? "linear-gradient(90deg, #3B82F6, #1D4ED8)"
                            : "#EFF6FF",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Última Foto — rows 1+2, col 3 */}
              <div
                className="rounded-[22px] border border-[#DBEAFE] bg-white p-1.5 shadow-[0_10px_24px_rgba(37,99,235,0.08)] flex flex-col"
                style={{ gridRow: "1 / 3", gridColumn: "3 / 4" }}
              >
                <div className="mb-1 px-0.5 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-wide">
                    Última Foto
                  </span>
                  <ImageIcon size={13} className="text-[#1D4ED8]" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoIndex(0);
                    setShowPhotoGallery(true);
                  }}
                  className="flex-1 block w-full min-h-0"
                >
                  <div
                    className="h-full w-full rounded-[10px] overflow-hidden"
                    style={{
                      backgroundImage: `url(${latestProgressPhoto})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </button>
              </div>

              {/* Atividade de hoje — row 2, cols 1+2 — compact single row */}
              <div
                className="rounded-[22px] border border-[#DBEAFE] bg-white px-2.5 py-2 shadow-[0_8px_18px_rgba(37,99,235,0.07)] flex items-center justify-between"
                style={{ gridRow: "2 / 3", gridColumn: "1 / 3" }}
              >
                {/* Calorias */}
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: colorTheme === "pink" ? "linear-gradient(135deg,#FCE7F3,#FBCFE8)" : "linear-gradient(135deg,#DBEAFE,#BFDBFE)" }}>
                    <Flame size={12} style={{ color: colorTheme === "pink" ? "#DB2777" : "#2563EB" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-[#0F172A] leading-none">420</p>
                    <p className="text-[8px] text-[#64748B]">Kcal</p>
                  </div>
                </div>
                <div className="w-px h-7 bg-[#EFF6FF]" />
                {/* Passos */}
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: colorTheme === "pink" ? "linear-gradient(135deg,#FCE7F3,#FBCFE8)" : "linear-gradient(135deg,#DBEAFE,#BFDBFE)" }}>
                    <Timer size={12} style={{ color: colorTheme === "pink" ? "#DB2777" : "#2563EB" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-[#0F172A] leading-none">6.2k</p>
                    <p className="text-[8px] text-[#64748B]">Passos</p>
                  </div>
                </div>
                <div className="w-px h-7 bg-[#EFF6FF]" />
                {/* Treinos */}
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: colorTheme === "pink" ? "linear-gradient(135deg,#FCE7F3,#FBCFE8)" : "linear-gradient(135deg,#DBEAFE,#BFDBFE)" }}>
                    <Activity size={12} style={{ color: colorTheme === "pink" ? "#DB2777" : "#2563EB" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-[#0F172A] leading-none">{completedTrainingsCount}</p>
                    <p className="text-[8px] text-[#64748B]">Treinos</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {showPhotoGallery ? (
            <div className="fixed inset-0 z-[70] bg-[#0F172A]/80 backdrop-blur-sm px-4 py-6 flex items-center justify-center">
              <div className="w-full max-w-[420px] rounded-3xl border border-[#DBEAFE] bg-white overflow-hidden shadow-2xl">
                <div className="px-3 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                  <p className="text-[13px] font-black text-[#0F172A]">
                    Galeria de progresso ({photoIndex + 1}/{galleryPhotos.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPhotoGallery(false)}
                    className="h-8 w-8 rounded-lg border border-[#DBEAFE] text-[#475569] grid place-items-center"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="relative bg-[#0B1220]">
                  <img
                    src={selectedPhotoMeta?.url ?? latestProgressPhoto}
                    alt={`Progresso ${photoIndex + 1}`}
                    className="h-[320px] w-full object-cover"
                  />

                  {galleryPhotos.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoIndex(prev => (prev - 1 + galleryPhotos.length) % galleryPhotos.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 text-[#0F172A] grid place-items-center"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoIndex(prev => (prev + 1) % galleryPhotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 text-[#0F172A] grid place-items-center"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="px-3 py-2 border-t border-[#E2E8F0] bg-white">
                  <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide font-black text-[#64748B]">Data da foto</p>
                    <p className="text-[13px] font-black text-[#0F172A] mt-0.5">
                      {formatDateLabel(selectedPhotoDate)}
                    </p>
                    <p className="text-[11px] text-[#475569]">{formatMonthYearLabel(selectedPhotoDate)}</p>
                  </div>
                </div>

                <div className="px-3 py-2.5 bg-[#F8FAFF] border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {galleryPhotos.map((item, index) => (
                      <button
                        key={`${item.url}-${index}`}
                        type="button"
                        onClick={() => setPhotoIndex(index)}
                        className={`shrink-0 h-14 w-14 rounded-xl overflow-hidden border-2 ${
                          photoIndex === index ? "border-[#2563EB]" : "border-[#DBEAFE]"
                        }`}
                      >
                        <img src={item.url} alt={`Thumb ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoGallery(false);
                      setLocation("/profile");
                    }}
                    className="mt-2 w-full h-9 rounded-xl bg-[#2563EB] text-white text-[12px] font-black"
                  >
                    Adicionar nova foto de progresso
                  </button>
                </div>
              </div>
            </div>
          ) : null}

      </div>

      <BottomNav />
    </div>
  );
}

function formatDateLabel(input: string) {
  const d = new Date(`${input}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatMonthYearLabel(input: string) {
  const d = new Date(`${input}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Mês não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(d);
}
