import { useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Gift,
  HeartPulse,
  Medal,
  Sparkles,
  TicketPercent,
  Trophy,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import { getCompletedWorkouts, getProgressLogs } from "@/lib/workoutData";
import { useTheme } from "@/contexts/ThemeContext";

const WEEK_GOAL = 5;

const LEADERBOARD = [
  { rank: 1, name: "Carlos R.", points: 1840, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80", badge: "🥇" },
  { rank: 2, name: "Welington", points: 1420, avatar: "/welington-profile.png", badge: "🥈", isUser: true },
  { rank: 3, name: "Marcos T.", points: 1190, avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=80&q=80", badge: "🥉" },
  { rank: 4, name: "Fábio L.", points: 980, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80", badge: "4º" },
  { rank: 5, name: "Rafael S.", points: 760, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80", badge: "5º" },
];

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const { colorTheme } = useTheme();
  const completed = getCompletedWorkouts();
  const logs = getProgressLogs();

  const primary = colorTheme === "pink" ? "#DB2777" : "#2563EB";
  const primaryLight = colorTheme === "pink" ? "#FCE7F3" : "#DBEAFE";
  const primaryGrad = colorTheme === "pink"
    ? "linear-gradient(135deg,#EC4899,#DB2777)"
    : "linear-gradient(135deg,#3B82F6,#1D4ED8)";

  const visual = useMemo(() => {
    const uniqueDates = Array.from(new Set(completed.map(k => k.split("_").slice(1).join("_")))).filter(Boolean);
    const sessions = uniqueDates.length;
    const points = sessions * 35 + logs.length * 5;
    const consistency = Math.min(100, Math.round((sessions / Math.max(1, WEEK_GOAL)) * 100));
    const challengeA = Math.min(sessions, 8);
    const challengeB = Math.min(Math.floor(logs.length / 2), 10);
    return { sessions, points, consistency, challengeA, challengeB };
  }, [completed, logs]);

  const rewards = [
    { id: "cupom-10", title: "Cupom 10% suplementos", description: "Parceiros oficiais.", pointsRequired: 120, unlocked: visual.points >= 120, icon: <TicketPercent size={16} /> },
    { id: "sessao-nutri", title: "Sessão com nutricionista", description: "Consulta online gratuita.", pointsRequired: 240, unlocked: visual.points >= 240, icon: <HeartPulse size={16} /> },
    { id: "sessao-personal", title: "Sessão com personal", description: "Ajuste técnico de treino.", pointsRequired: 320, unlocked: visual.points >= 320, icon: <Dumbbell size={16} /> },
    { id: "brinde-kit", title: "Brinde premium", description: "Camiseta ou squeeze exclusivo.", pointsRequired: 420, unlocked: visual.points >= 420, icon: <Gift size={16} /> },
  ];

  const challenges = [
    { id: "constancia-8", title: "Consistência semanal", progress: visual.challengeA, target: 8, unit: "treinos", icon: <Flame size={14} /> },
    { id: "desafio-logs", title: "Desafio de progresso", progress: visual.challengeB, target: 10, unit: "registros", icon: <Zap size={14} /> },
  ];

  // Podium order: 2nd, 1st, 3rd
  const podium = [LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]];
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(180deg,#F0F6FF 0%,#E8F0FE 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/60" style={{ background: "rgba(255,255,255,0.88)" }}>
        <div className="mx-auto max-w-[420px] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center" style={{ color: primary }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Conquistas</p>
            <h1 className="text-[17px] font-black text-[#0F172A] leading-tight">Ranking & Recompensas</h1>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black"
            style={{ background: primaryLight, borderColor: primary + "40", color: primary }}>
            <Sparkles size={11} /> VIP
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[420px] px-4 pt-4 space-y-3">

        {/* User stats hero */}
        <div className="rounded-3xl overflow-hidden shadow-[0_12px_28px_rgba(37,99,235,0.18)]">
          <div className="px-4 pt-4 pb-5 text-white relative" style={{ background: primaryGrad }}>
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/10 blur-2xl -translate-y-8 translate-x-8" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Seu desempenho</p>
            <p className="text-[24px] font-black leading-none">{visual.points} <span className="text-[14px] font-bold text-white/70">pts</span></p>
            <p className="text-[12px] font-bold text-white/80 mt-0.5">2º lugar no ranking · VIP</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Sessões", value: visual.sessions, icon: <Dumbbell size={12}/> },
                { label: "Consistência", value: `${visual.consistency}%`, icon: <Trophy size={12}/> },
                { label: "Sequência", value: "3 dias", icon: <Flame size={12}/> },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/15 border border-white/20 px-2 py-2 text-center">
                  <div className="flex justify-center mb-0.5 text-white/70">{s.icon}</div>
                  <p className="text-[15px] font-black leading-none">{s.value}</p>
                  <p className="text-[8px] text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* week progress bar */}
          <div className="bg-white px-4 py-3">
            <div className="flex items-center justify-between text-[11px] font-black mb-1.5">
              <span className="text-[#0F172A]">Meta da semana</span>
              <span style={{ color: primary }}>{Math.min(visual.sessions, WEEK_GOAL)}/{WEEK_GOAL} treinos</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#EEF4FF] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((visual.sessions / WEEK_GOAL) * 100))}%`, background: primaryGrad }} />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-3xl border border-[#DBEAFE] bg-white shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Ranking</p>
              <h2 className="text-[15px] font-black text-[#0F172A]">Top 5 da semana</h2>
            </div>
            <Medal size={20} style={{ color: primary }} />
          </div>

          {/* Podium: 2nd · 1st · 3rd */}
          <div className="px-3 pt-2 pb-4 flex items-end justify-center gap-2">
            {podium.map((p, idx) => {
              const isFirst = p.rank === 1;
              const isUser = (p as typeof p & { isUser?: boolean }).isUser;
              const heights = ["h-[88px]", "h-[110px]", "h-[76px]"];
              const podiumColors = [
                "linear-gradient(180deg,#CBD5E1,#94A3B8)",
                "linear-gradient(180deg,#FCD34D,#F59E0B)",
                "linear-gradient(180deg,#FDBA74,#EA580C)",
              ];
              return (
                <div key={p.rank} className="flex flex-col items-center gap-1.5 flex-1">
                  {/* Avatar */}
                  <div className="relative">
                    <img src={p.avatar} alt={p.name}
                      className={`rounded-full object-cover border-2 ${isFirst ? "w-14 h-14" : "w-11 h-11"}`}
                      style={{ borderColor: isFirst ? "#F59E0B" : isUser ? primary : "#CBD5E1" }}
                    />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[13px]">{p.badge}</span>
                  </div>
                  <p className={`text-center font-black truncate w-full px-1 ${isFirst ? "text-[12px] text-[#0F172A]" : "text-[10px] text-[#475569]"}`}>
                    {p.name}
                  </p>
                  <p className="text-[9px] font-bold" style={{ color: primary }}>{p.points} pts</p>
                  {/* Podium bar */}
                  <div className={`w-full rounded-t-xl ${heights[idx]} flex items-center justify-center`}
                    style={{ background: podiumColors[idx] }}>
                    <span className="text-white font-black text-[18px] drop-shadow">{p.rank}º</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4th and 5th */}
          <div className="border-t border-[#EFF6FF] divide-y divide-[#EFF6FF]">
            {rest.map(p => {
              const isUser = (p as typeof p & { isUser?: boolean }).isUser;
              return (
                <div key={p.rank} className={`flex items-center gap-3 px-4 py-2.5 ${isUser ? "bg-[#F0F6FF]" : ""}`}>
                  <span className="text-[12px] font-black w-5 text-center" style={{ color: primary }}>{p.rank}º</span>
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-[#DBEAFE]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-[#0F172A] truncate">{p.name}{isUser ? " (você)" : ""}</p>
                  </div>
                  <span className="text-[12px] font-black" style={{ color: primary }}>{p.points} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Challenges */}
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-black text-[#0F172A]">Desafios</h3>
            <span className="text-[10px] font-black text-[#64748B] uppercase">Em andamento</span>
          </div>
          <div className="space-y-3">
            {challenges.map(item => (
              <div key={item.id} className="rounded-xl border border-[#DBEAFE] bg-[#FAFCFF] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: primaryLight, color: primary }}>{item.icon}</span>
                  <p className="text-[12px] font-black text-[#0F172A] flex-1">{item.title}</p>
                  <p className="text-[11px] font-black" style={{ color: primary }}>{item.progress}/{item.target}</p>
                </div>
                <div className="h-2 rounded-full bg-[#DBEAFE] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((item.progress / item.target) * 100))}%`, background: primaryGrad }} />
                </div>
                <p className="text-[9px] text-[#94A3B8] mt-1">{item.progress} de {item.target} {item.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-black text-[#0F172A]">Recompensas</h3>
            <span className="text-[10px] font-black text-[#64748B] uppercase">Resgate</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {rewards.map(item => (
              <div key={item.id} className={`rounded-xl border p-3 flex flex-col gap-1.5 ${item.unlocked ? "border-green-200 bg-green-50" : "border-[#DBEAFE] bg-[#FAFCFF]"}`}>
                <span className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: item.unlocked ? "#DCFCE7" : primaryLight, color: item.unlocked ? "#15803D" : primary }}>
                  {item.icon}
                </span>
                <p className="text-[11px] font-black text-[#0F172A] leading-tight">{item.title}</p>
                <p className="text-[9px] text-[#64748B]">{item.pointsRequired} pts</p>
                <button
                  type="button"
                  disabled={!item.unlocked}
                  className="mt-auto rounded-lg py-1 text-[10px] font-black text-white disabled:opacity-40"
                  style={{ background: item.unlocked ? "#16A34A" : primaryGrad }}
                >
                  {item.unlocked ? "✓ Resgatar" : "Bloqueado"}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
