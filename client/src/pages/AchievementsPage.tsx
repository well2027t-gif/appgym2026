import { useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Gift,
  HeartPulse,
  Medal,
  Smartphone,
  Sparkles,
  TicketPercent,
  Trophy,
  Watch,
} from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import { getCompletedWorkouts, getProgressLogs } from "@/lib/workoutData";

type RewardItem = {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  unlocked: boolean;
  icon: React.ReactNode;
};

type ChallengeItem = {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
};

const WEEK_GOAL = 5;

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const completed = getCompletedWorkouts();
  const logs = getProgressLogs();

  const visual = useMemo(() => {
    const uniqueDates = Array.from(new Set(completed.map(k => k.split("_").slice(1).join("_")))).filter(Boolean);
    const sessions = uniqueDates.length;
    const points = sessions * 35 + logs.length * 5;
    const consistency = Math.min(100, Math.round((sessions / Math.max(1, WEEK_GOAL)) * 100));
    const challengeA = Math.min(sessions, 8);
    const challengeB = Math.min(Math.floor(logs.length / 2), 10);

    return { sessions, points, consistency, challengeA, challengeB };
  }, [completed, logs]);

  const rewards: RewardItem[] = [
    {
      id: "cupom-10",
      title: "Cupom de 10% em suplementos",
      description: "Parceiros oficiais do app.",
      pointsRequired: 120,
      unlocked: visual.points >= 120,
      icon: <TicketPercent size={18} />,
    },
    {
      id: "sessao-nutri",
      title: "Sessao gratuita com nutricionista",
      description: "Consulta online de orientacao inicial.",
      pointsRequired: 240,
      unlocked: visual.points >= 240,
      icon: <HeartPulse size={18} />,
    },
    {
      id: "sessao-personal",
      title: "Sessao gratuita com personal",
      description: "Ajuste tecnico e evolucao de treino.",
      pointsRequired: 320,
      unlocked: visual.points >= 320,
      icon: <Dumbbell size={18} />,
    },
    {
      id: "brinde-kit",
      title: "Brinde premium do app",
      description: "Camiseta ou squeeze exclusivo.",
      pointsRequired: 420,
      unlocked: visual.points >= 420,
      icon: <Gift size={18} />,
    },
  ];

  const challenges: ChallengeItem[] = [
    {
      id: "constancia-8",
      title: "Constancia semanal",
      progress: visual.challengeA,
      target: 8,
      unit: "treinos",
    },
    {
      id: "desafio-logs",
      title: "Desafio de progresso",
      progress: visual.challengeB,
      target: 10,
      unit: "registros",
    },
  ];

  const wearables = [
    { id: "apple-watch", name: "Apple Watch", status: "Pronto para conectar", connected: false, icon: <Watch size={16} /> },
    { id: "garmin", name: "Garmin", status: "Pronto para conectar", connected: false, icon: <Smartphone size={16} /> },
    { id: "fitbit", name: "Fitbit", status: "Conectado (demo)", connected: true, icon: <Watch size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F5F9FF] to-[#E7F0FF] pb-28">
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#DBEAFE]">
        <div className="mx-auto max-w-[420px] px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => setLocation("/")}
            className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center text-[#1D4ED8]"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-black">Conquistas</p>
            <h1 className="text-[18px] font-black text-[#0F172A] truncate">Painel de recompensas</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[420px] px-4 pt-4 space-y-3">
        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] text-[#64748B] uppercase tracking-[0.16em] font-black">Resumo</p>
              <h2 className="text-[18px] font-black text-[#0F172A] mt-1">Seu nivel de evolucao</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF6FF] border border-[#DBEAFE] px-2 py-1 text-[10px] font-black text-[#1D4ED8]">
              <Sparkles size={12} />
              VIP
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatMini title="Pontos" value={String(visual.points)} icon={<Medal size={14} />} />
            <StatMini title="Sessoes" value={String(visual.sessions)} icon={<Dumbbell size={14} />} />
            <StatMini title="Consistencia" value={`${visual.consistency}%`} icon={<Trophy size={14} />} />
          </div>

          <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-3">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-[#0F172A]">Meta da semana ({WEEK_GOAL} treinos)</span>
              <span className="text-[#1D4ED8]">{Math.min(visual.sessions, WEEK_GOAL)}/{WEEK_GOAL}</span>
            </div>
            <div className="mt-2 h-2.5 rounded-full bg-[#DBEAFE] overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#3B82F6] to-[#1D4ED8]"
                style={{ width: `${Math.min(100, Math.round((visual.sessions / WEEK_GOAL) * 100))}%` }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[#0F172A]">Desafios concluiveis</h3>
            <span className="text-[10px] font-black text-[#64748B] uppercase">Em andamento</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {challenges.map(item => (
              <div key={item.id} className="rounded-xl border border-[#DBEAFE] bg-[#FAFCFF] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-black text-[#0F172A]">{item.title}</p>
                  <p className="text-[11px] font-black text-[#1D4ED8]">
                    {item.progress}/{item.target} {item.unit}
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#DBEAFE] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#60A5FA] to-[#2563EB]"
                    style={{ width: `${Math.min(100, Math.round((item.progress / item.target) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[#0F172A]">Recompensas reais</h3>
            <span className="text-[10px] font-black text-[#64748B] uppercase">Resgate</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {rewards.map(item => (
              <div key={item.id} className="rounded-xl border border-[#DBEAFE] bg-[#FAFCFF] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-[#0F172A]">{item.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.description}</p>
                    <p className="text-[10px] font-black text-[#1E3A8A] mt-1.5">
                      Requer {item.pointsRequired} pontos
                    </p>
                  </div>
                  <span className="h-8 w-8 rounded-lg border border-[#DBEAFE] bg-white text-[#1D4ED8] grid place-items-center shrink-0">
                    {item.icon}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {item.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#15803D]">
                      <CheckCircle2 size={12} />
                      Disponivel para resgate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#64748B]">
                      <Clock3 size={12} />
                      Continue evoluindo
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={!item.unlocked}
                    className="h-8 px-3 rounded-lg text-[11px] font-black text-white bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resgatar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[#0F172A]">Integracao wearable</h3>
            <span className="text-[10px] font-black text-[#64748B] uppercase">Validacao</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">
            Conecte dispositivos para validar atividade fisica e ganhar pontos automáticos.
          </p>
          <div className="mt-3 space-y-2">
            {wearables.map(item => (
              <div key={item.id} className="rounded-xl border border-[#DBEAFE] bg-[#FAFCFF] px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-8 w-8 rounded-lg border border-[#DBEAFE] bg-white text-[#1D4ED8] grid place-items-center shrink-0">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-[#0F172A]">{item.name}</p>
                    <p className={`text-[10px] font-bold ${item.connected ? "text-[#15803D]" : "text-[#64748B]"}`}>
                      {item.status}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`h-8 px-3 rounded-lg text-[11px] font-black ${
                    item.connected
                      ? "bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]"
                      : "bg-[#2563EB] text-white"
                  }`}
                >
                  {item.connected ? "Ativo" : "Conectar"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

function StatMini({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#DBEAFE] bg-[#FAFCFF] p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase text-[#64748B]">{title}</p>
        <span className="text-[#1D4ED8]">{icon}</span>
      </div>
      <p className="text-[20px] font-black text-[#0F172A] mt-1">{value}</p>
    </div>
  );
}
