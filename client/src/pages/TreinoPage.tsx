import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Dumbbell,
  Footprints,
  Flame,
  Gauge,
  HeartPulse,
  Layers3,
  PersonStanding,
  Search,
  SkipForward,
  Scale,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Undo2,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { defaultWorkoutProgram, type MuscleGroup } from "@/lib/workoutData";

const GOALS = [
  { id: "hipertrofia", label: "Hipertrofia", icon: Flame, hint: "Ganho de massa" },
  { id: "emagrecimento", label: "Emagrecimento", icon: Scale, hint: "Queima de gordura" },
  { id: "resistencia", label: "Resistência", icon: HeartPulse, hint: "Mais fôlego" },
  { id: "condicionamento", label: "Condicionamento", icon: Timer, hint: "Melhor preparo" },
  { id: "forca", label: "Força", icon: Dumbbell, hint: "Cargas mais altas" },
  { id: "definicao", label: "Definição", icon: Sparkles, hint: "Corpo mais seco" },
  { id: "mobilidade", label: "Mobilidade", icon: Activity, hint: "Movimento e postura" },
  { id: "saude", label: "Saúde", icon: HeartPulse, hint: "Qualidade de vida" },
] as const;

const DAYS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"] as const;
const TRAINING_PERIODS = ["Manhã", "Tarde", "Noite"] as const;
const LEVELS = ["Iniciante", "Intermediário", "Avançado"] as const;
const LEVEL_DESCRIPTIONS: Record<(typeof LEVELS)[number], string> = {
  Iniciante: "Para quem está começando agora ou voltou a treinar recentemente.",
  Intermediário: "Para quem já treina com frequência e tem boa execução dos movimentos.",
  Avançado: "Para quem tem experiência alta, volume maior e controle técnico das cargas.",
};
const SPLITS = ["Full Body", "AB", "ABC", "ABCD"] as const;
const SPLIT_DESCRIPTIONS: Record<(typeof SPLITS)[number], { summary: string; example: string }> = {
  "Full Body": {
    summary: "Treina o corpo inteiro no mesmo dia.",
    example: "Exemplo: peito, costas, pernas e abdômen no mesmo treino.",
  },
  AB: {
    summary: "Divide em dois treinos diferentes (A e B).",
    example: "Exemplo: A = superiores / B = inferiores, alternando os dias.",
  },
  ABC: {
    summary: "Divide em três treinos (A, B e C).",
    example: "Exemplo: A = peito/tríceps, B = costas/bíceps, C = pernas/ombro.",
  },
  ABCD: {
    summary: "Divide em quatro treinos mais específicos.",
    example: "Exemplo: cada dia com foco em grupos musculares mais separados.",
  },
};
const DURATIONS = [30, 45, 60] as const;
const EXERCISE_FILTERS = ["Todos", "Cardio", "Peito", "Costas", "Pernas", "Abdômen"] as const;

type ExerciseVisual = "bike" | "activity" | "footprints" | "standing" | "jump" | "dumbbell";
type ExerciseLibraryItem = {
  id: string;
  name: string;
  muscle: MuscleGroup;
  visual: ExerciseVisual;
};

function visualByMuscle(muscle: MuscleGroup): ExerciseVisual {
  if (muscle === "Cardio") return "footprints";
  if (muscle === "Pernas" || muscle === "Glúteo" || muscle === "Posterior") return "standing";
  if (muscle === "Abdômen") return "activity";
  return "dumbbell";
}

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = (() => {
  const uniqueByName = new Map<string, ExerciseLibraryItem>();
  for (const day of defaultWorkoutProgram) {
    for (const exercise of day.exercises) {
      const normalizedName = exercise.name.trim().toLowerCase();
      if (!normalizedName || uniqueByName.has(normalizedName)) continue;
      uniqueByName.set(normalizedName, {
        id: exercise.id,
        name: exercise.name,
        muscle: exercise.muscleGroup,
        visual: visualByMuscle(exercise.muscleGroup),
      });
    }
  }
  return Array.from(uniqueByName.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
})();

const WIZARD_STEPS = [
  "Objetivo",
  "Dia",
  "Nível",
  "Dias",
  "Divisão",
  "Duração",
  "Exercícios",
  "Resumo",
] as const;

const TRAINING_WIZARD_STORAGE_KEY = "gymtracker_training_wizard_v1";

type SelectedExerciseItem = ExerciseLibraryItem & {
  sets: number;
  reps: number;
  weight: number;
};
type DayName = (typeof DAYS)[number];

function getExerciseIcon(visual: (typeof EXERCISE_LIBRARY)[number]["visual"]) {
  if (visual === "bike") return Bike;
  if (visual === "activity") return Activity;
  if (visual === "footprints") return Footprints;
  if (visual === "standing") return PersonStanding;
  if (visual === "jump") return SkipForward;
  return Dumbbell;
}

export default function TreinoPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [hasSavedSetup, setHasSavedSetup] = useState(false);
  const [goal, setGoal] = useState<(typeof GOALS)[number]["id"]>("hipertrofia");
  const [trainingDay, setTrainingDay] = useState<(typeof DAYS)[number]>("Segunda-feira");
  const [trainingPeriod, setTrainingPeriod] = useState<(typeof TRAINING_PERIODS)[number]>("Manhã");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Intermediário");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [split, setSplit] = useState<(typeof SPLITS)[number]>("AB");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(45);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExerciseItem[]>([]);
  const [dayTrainings, setDayTrainings] = useState<Record<DayName, SelectedExerciseItem[]>>(() =>
    Object.fromEntries(DAYS.map((day) => [day, []])) as Record<DayName, SelectedExerciseItem[]>,
  );
  const [exerciseFilter, setExerciseFilter] = useState<(typeof EXERCISE_FILTERS)[number]>("Todos");
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [pendingExercise, setPendingExercise] = useState<ExerciseLibraryItem | null>(null);
  const [pendingSets, setPendingSets] = useState(3);
  const [pendingReps, setPendingReps] = useState(10);
  const [pendingWeight, setPendingWeight] = useState(0);

  const selectedGoalLabel = GOALS.find((item) => item.id === goal)?.label ?? "Hipertrofia";
  const filteredExercises = useMemo(() => {
    const q = exerciseQuery.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((exercise) => {
      const filterOk = exerciseFilter === "Todos" || exercise.muscle === exerciseFilter;
      const queryOk =
        q.length === 0 || exercise.name.toLowerCase().includes(q) || exercise.muscle.toLowerCase().includes(q);
      return filterOk && queryOk;
    });
  }, [exerciseFilter, exerciseQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(TRAINING_WIZARD_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        goal?: (typeof GOALS)[number]["id"];
        level?: (typeof LEVELS)[number];
        daysPerWeek?: number;
        split?: (typeof SPLITS)[number];
        duration?: (typeof DURATIONS)[number];
        trainingDay?: (typeof DAYS)[number];
        trainingPeriod?: (typeof TRAINING_PERIODS)[number];
        dayTrainings?: Partial<Record<DayName, SelectedExerciseItem[]>>;
      };
      if (saved.goal) setGoal(saved.goal);
      if (saved.level) setLevel(saved.level);
      if (saved.daysPerWeek && saved.daysPerWeek >= 1 && saved.daysPerWeek <= 7) {
        setDaysPerWeek(saved.daysPerWeek);
      }
      if (saved.split) setSplit(saved.split);
      if (saved.duration) setDuration(saved.duration);
      if (saved.trainingDay) setTrainingDay(saved.trainingDay);
      if (saved.trainingPeriod) setTrainingPeriod(saved.trainingPeriod);
      if (saved.dayTrainings) {
        const mergedTrainings = {
          ...(Object.fromEntries(DAYS.map((day) => [day, []])) as Record<DayName, SelectedExerciseItem[]>),
          ...saved.dayTrainings,
        };
        setDayTrainings(mergedTrainings);
        const activeDay = (saved.trainingDay ?? "Segunda-feira") as DayName;
        setSelectedExercises(mergedTrainings[activeDay] ?? []);
      }
      setHasSavedSetup(true);
      setStep(0); // sempre abre na primeira etapa (Objetivo)
    } catch {
      // Ignore parse issues and keep defaults.
    }
  }, []);

  function openExerciseConfig(exercise: ExerciseLibraryItem) {
    setPendingExercise(exercise);
    setPendingSets(3);
    setPendingReps(10);
    setPendingWeight(0);
  }

  function confirmExerciseConfig() {
    if (!pendingExercise) return;
    const alreadyExists = selectedExercises.some((item) => item.id === pendingExercise.id);
    if (!alreadyExists) {
      const nextExercises = [
        ...selectedExercises,
        {
          ...pendingExercise,
          sets: Math.max(1, pendingSets),
          reps: Math.max(1, pendingReps),
          weight: Math.max(0, pendingWeight),
        },
      ];
      updateCurrentDayExercises(nextExercises);
    }
    setPendingExercise(null);
  }

  function closeExerciseConfig() {
    setPendingExercise(null);
  }

  function updateCurrentDayExercises(nextExercises: SelectedExerciseItem[]) {
    setSelectedExercises(nextExercises);
    setDayTrainings((prev) => ({ ...prev, [trainingDay]: nextExercises }));
  }

  function selectTrainingDay(day: DayName) {
    setTrainingDay(day);
    setSelectedExercises(dayTrainings[day] ?? []);
  }

  function handleGoalSelection(nextGoal: (typeof GOALS)[number]["id"]) {
    if (nextGoal === goal) return;
    const hasAnyTraining = Object.values(dayTrainings).some((items) => items.length > 0);

    if (hasAnyTraining && typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Você já possui treinos montados. Deseja excluir todos os treinos para trocar o objetivo?",
      );
      if (!confirmed) return;
      const resetTrainings = Object.fromEntries(DAYS.map((day) => [day, []])) as Record<
        DayName,
        SelectedExerciseItem[]
      >;
      setDayTrainings(resetTrainings);
      setSelectedExercises([]);
    }

    setGoal(nextGoal);
  }

  function removeExercise(exerciseId: string) {
    updateCurrentDayExercises(selectedExercises.filter((item) => item.id !== exerciseId));
  }

  function moveExercise(exerciseId: string, direction: "up" | "down") {
    const index = selectedExercises.findIndex((item) => item.id === exerciseId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= selectedExercises.length) return;
    const copy = [...selectedExercises];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    updateCurrentDayExercises(copy);
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function getNextDay(currentDay: (typeof DAYS)[number]) {
    const idx = DAYS.indexOf(currentDay);
    if (idx < 0) return DAYS[0];
    return DAYS[(idx + 1) % DAYS.length];
  }

  function finishAndKeepEditing() {
    if (typeof window !== "undefined") {
      const payload = {
        goal,
        level,
        daysPerWeek,
        split,
        duration,
        trainingDay,
        trainingPeriod,
        dayTrainings,
      };
      window.localStorage.setItem(TRAINING_WIZARD_STORAGE_KEY, JSON.stringify(payload));
    }
    setHasSavedSetup(true);
    const nextDay = getNextDay(trainingDay);
    setTrainingDay(nextDay);
    setSelectedExercises(dayTrainings[nextDay] ?? []);
    setExerciseQuery("");
    setExerciseFilter("Todos");
    setStep(1);
  }

  function deleteCurrentDayTraining() {
    if (selectedExercises.length === 0) {
      if (typeof window !== "undefined") {
        window.alert("Não há treinos adicionados neste dia para excluir.");
      }
      return;
    }
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Tem certeza que deseja excluir os treinos deste dia?");
      if (!confirmed) return;
    }
    updateCurrentDayExercises([]);
  }

  return (
    <div
      className="min-h-[100dvh] overflow-hidden text-[#0F172A]"
      style={{
        backgroundImage:
          "radial-gradient(circle at top, rgba(191,219,254,0.65), rgba(255,255,255,0.9) 34%), linear-gradient(180deg, rgba(255,255,255,0.94), rgba(226,239,255,0.96))",
      }}
    >
      <div
        className="min-h-[100dvh] overflow-y-auto px-4 max-w-[420px] mx-auto pt-2 pb-[calc(7.25rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="sticky top-0 z-20 bg-white/92 backdrop-blur-md rounded-2xl border border-[#DBEAFE] shadow px-3 py-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step > 0 ? prevStep() : setLocation("/"))}
              className="h-9 w-9 rounded-full border border-[#DBEAFE] bg-white text-[#2563EB] flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[16px] font-black text-[#0F172A]">Personalizar Treino</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#1D4ED8]">
                {step + 1}/{WIZARD_STEPS.length}
              </span>
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="h-8 w-8 rounded-full border border-[#DBEAFE] bg-white text-[#2563EB] flex items-center justify-center"
                aria-label="Fechar personalização e voltar para início"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-8 gap-1">
            {WIZARD_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full ${idx <= step ? "bg-[#2563EB]" : "bg-[#DBEAFE]"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 rounded-3xl border border-[#DBEAFE] bg-white/92 p-3 shadow-[0_18px_34px_rgba(37,99,235,0.14)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Etapa atual</p>
          <p className="text-[18px] font-black text-[#0F172A]">{WIZARD_STEPS[step]}</p>
          <p className="text-[11px] text-[#64748B] mt-1">
            Configure uma parte por vez e avance em “Próximo”.
          </p>
          {hasSavedSetup && (
            <p className="text-[10px] font-bold text-[#1D4ED8] mt-1.5">
              Configurações gerais já salvas. Agora edite direto por dia.
            </p>
          )}
        </div>

        <div className="mt-2.5 space-y-2.5">
          {step === 0 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2.5 flex items-center gap-2">
                <Target size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Objetivo do treino</h2>
              </div>
            <div className="grid grid-cols-2 gap-2">
                {GOALS.map((item) => {
                  const selected = goal === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleGoalSelection(item.id)}
                      className={`rounded-2xl border p-3 flex flex-col items-center gap-1.5 ${
                        selected ? "bg-[#EFF6FF] border-[#2563EB]" : "bg-white border-[#E5E7EB]"
                      }`}
                    >
                      <Icon size={16} className={selected ? "text-[#2563EB]" : "text-[#64748B]"} />
                      <span className={`text-[12px] font-bold leading-tight text-center ${selected ? "text-[#1E40AF]" : "text-[#334155]"}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] leading-tight text-center ${selected ? "text-[#1D4ED8]" : "text-[#64748B]"}`}>
                        {item.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2.5 flex items-center gap-2">
                <CalendarDays size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Escolha o dia do treino</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectTrainingDay(day)}
                    className={`rounded-xl border px-3 py-2 text-[12px] font-bold ${
                      trainingDay === day
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF]"
                        : "bg-white border-[#DBEAFE] text-[#334155]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2.5 py-2">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wide">
                  Período do treino
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TRAINING_PERIODS.map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setTrainingPeriod(period)}
                      className={`rounded-full px-2 py-2 text-[12px] font-bold ${
                        trainingPeriod === period
                          ? "bg-[#2563EB] text-white"
                          : "bg-white border border-[#DBEAFE] text-[#334155]"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] p-2.5">
                <p className="text-[10px] text-[#64748B] font-semibold">
                  {selectedExercises.length > 0
                    ? `${selectedExercises.length} exercício(s) já salvo(s) em ${trainingDay}.`
                    : `Nenhum exercício salvo em ${trainingDay} ainda.`}
                </p>
                <div className={`mt-2 grid gap-2 ${selectedExercises.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="py-2 rounded-xl border border-[#BFDBFE] bg-white text-[#1D4ED8] text-[11px] font-black"
                  >
                    Personalizar Treino
                  </button>
                  {selectedExercises.length > 0 && (
                    <button
                      type="button"
                      onClick={deleteCurrentDayTraining}
                      className="py-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] text-[11px] font-black"
                    >
                      Excluir Treino
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2 flex items-center gap-2">
                <Gauge size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Nível de treino</h2>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#F1F5F9] p-1">
                {LEVELS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    className={`rounded-full px-2 py-2 text-[12px] font-bold ${
                      level === item ? "bg-[#2563EB] text-white" : "text-[#334155]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">{level}</p>
                <p className="mt-1 text-[11px] text-[#334155]">{LEVEL_DESCRIPTIONS[level]}</p>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#2563EB]" />
                  <h2 className="text-[13px] font-black text-[#0F172A]">Dias por semana</h2>
                </div>
                <span className="text-[12px] font-black text-[#1D4ED8]">{daysPerWeek} dias</span>
              </div>
              <div className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-3 py-3">
                <div className="relative">
                  <div className="h-2 rounded-full bg-[#DBEAFE]" />
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB] transition-all"
                    style={{ width: `${((daysPerWeek - 1) / 6) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={7}
                    step={1}
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="absolute inset-0 h-2 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDaysPerWeek(value)}
                      className={`h-7 rounded-full text-[10px] font-black transition-all ${
                        value <= daysPerWeek
                          ? "bg-[#2563EB] text-white"
                          : "bg-white border border-[#DBEAFE] text-[#64748B]"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2 flex items-center gap-2">
                <Layers3 size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Divisão de treino</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SPLITS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSplit(item)}
                    className={`rounded-full px-2 py-2 text-[12px] font-bold ${
                      split === item ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#334155]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-3 py-2.5">
                <p className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">{split}</p>
                <p className="mt-1 text-[11px] text-[#334155]">{SPLIT_DESCRIPTIONS[split].summary}</p>
                <p className="mt-1 text-[10px] text-[#64748B]">{SPLIT_DESCRIPTIONS[split].example}</p>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Duração do treino</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDuration(item)}
                    className={`rounded-full px-2 py-2 text-[12px] font-bold ${
                      duration === item ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#334155]"
                    }`}
                  >
                    {item} min
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-[#2563EB]" />
                <h2 className="text-[13px] font-black text-[#0F172A]">Montar treino do dia</h2>
              </div>
              <p className="text-[11px] text-[#64748B] mb-2">
                Primeiro adicione na biblioteca, depois confira na lista do treino.
              </p>

              <div className="mb-2 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2.5 py-2">
                <p className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-wide">
                  Biblioteca de exercícios
                </p>
              </div>
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2.5 py-2">
                <Search size={14} className="text-[#2563EB]" />
                <input
                  type="text"
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                  placeholder="Buscar exercício..."
                  className="w-full bg-transparent text-[12px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                {EXERCISE_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setExerciseFilter(item)}
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold border ${
                      exerciseFilter === item
                        ? "bg-[#2563EB] border-[#2563EB] text-white"
                        : "bg-white border-[#DBEAFE] text-[#334155]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredExercises.map((exercise) => {
                  const added = selectedExercises.some((item) => item.id === exercise.id);
                  const Icon = getExerciseIcon(exercise.visual);
                  return (
                    <div key={exercise.id} className="rounded-2xl border border-[#DBEAFE] overflow-hidden bg-white shadow-sm">
                      <div className="h-20 w-full bg-[#EAF2FF] border-b border-[#DBEAFE] flex items-center justify-center">
                        <Icon size={30} className="text-[#2563EB]" />
                      </div>
                      <div className="p-2">
                        <p className="text-[12px] font-black text-[#0F172A]">{exercise.name}</p>
                        <p className="text-[10px] text-[#64748B]">{exercise.muscle}</p>
                        <button
                          type="button"
                          onClick={() => openExerciseConfig(exercise)}
                          disabled={added}
                          className={`mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 ${
                            added ? "bg-[#E2E8F0] text-[#64748B]" : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                          }`}
                        >
                          {added ? <Check size={12} /> : <Plus size={12} />}
                          {added ? "Adicionado" : "Adicionar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredExercises.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] px-3 py-4 text-center text-[11px] text-[#64748B]">
                  Nenhum exercício encontrado para esse filtro.
                </div>
              )}

              <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2.5 py-2">
                <p className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-wide">
                  Treino do dia ({selectedExercises.length})
                </p>
              </div>
              {selectedExercises.length === 0 ? (
                <div className="mt-2 rounded-xl border border-dashed border-[#DBEAFE] bg-white px-3 py-4 text-center text-[11px] text-[#64748B]">
                  Adicione exercícios acima para montar seu treino.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {selectedExercises.map((exercise, idx) => {
                    const Icon = getExerciseIcon(exercise.visual);
                    return (
                      <div
                        key={exercise.id}
                        className="rounded-xl border border-[#DBEAFE] bg-white p-2 flex items-center gap-2"
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-[#2563EB]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black text-[#0F172A] truncate">
                            {idx + 1}. {exercise.name}
                          </p>
                          <p className="text-[10px] text-[#64748B]">{exercise.muscle}</p>
                          <p className="text-[10px] font-semibold text-[#1D4ED8]">
                            {exercise.sets}x{exercise.reps} • {exercise.weight}kg
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveExercise(exercise.id, "up")}
                            disabled={idx === 0}
                          className={`h-7 w-7 rounded-md border flex items-center justify-center ${
                              idx === 0
                                ? "border-[#E2E8F0] bg-[#F8FAFF] text-[#94A3B8]"
                              : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                            }`}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExercise(exercise.id, "down")}
                            disabled={idx === selectedExercises.length - 1}
                            className={`h-7 w-7 rounded-md border flex items-center justify-center ${
                              idx === selectedExercises.length - 1
                                ? "border-[#E2E8F0] bg-[#F8FAFF] text-[#94A3B8]"
                              : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                            }`}
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExercise(exercise.id)}
                            className="h-7 w-7 rounded-md border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === 7 && (
            <section className="rounded-[22px] border border-[#DBEAFE] bg-white p-3.5 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#2563EB]" />
                <p className="text-[12px] font-black text-[#0F172A]">Resumo final do treino</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2">
                  <p className="text-[#64748B] font-semibold">Objetivo</p>
                  <p className="text-[#1E3A8A] font-black">{selectedGoalLabel}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2">
                  <p className="text-[#64748B] font-semibold">Dia</p>
                  <p className="text-[#1E3A8A] font-black">{trainingDay}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2">
                  <p className="text-[#64748B] font-semibold">Período</p>
                  <p className="text-[#1E3A8A] font-black">{trainingPeriod}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2">
                  <p className="text-[#64748B] font-semibold">Nível</p>
                  <p className="text-[#1E3A8A] font-black">{level}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2">
                  <p className="text-[#64748B] font-semibold">Volume</p>
                  <p className="text-[#1E3A8A] font-black">{daysPerWeek}x / {duration}min</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFF] border border-[#DBEAFE] px-2.5 py-2 col-span-2">
                  <p className="text-[#64748B] font-semibold">Exercícios selecionados</p>
                  {selectedExercises.length === 0 ? (
                    <p className="text-[#64748B] font-black">Nenhum exercício selecionado</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {selectedExercises.map((exercise, idx) => (
                        <li key={exercise.id} className="text-[#1E3A8A] font-black">
                          {idx + 1}. {exercise.name} - {exercise.sets}x{exercise.reps} ({exercise.weight}kg)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {pendingExercise && (
        <div className="fixed inset-0 z-40 bg-[#0F172A]/35 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] rounded-3xl border border-[#DBEAFE] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide font-bold text-[#64748B]">Configurar exercício</p>
                <p className="text-[15px] font-black text-[#0F172A]">{pendingExercise.name}</p>
              </div>
              <button
                type="button"
                onClick={closeExerciseConfig}
                className="h-8 w-8 rounded-full border border-[#DBEAFE] bg-white text-[#2563EB] flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2 py-2">
                <span className="block text-[10px] font-bold text-[#64748B] mb-1">Séries</span>
                <input
                  type="number"
                  min={1}
                  value={pendingSets}
                  onChange={(e) => setPendingSets(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-[#DBEAFE] bg-white px-2 py-1.5 text-[12px] font-bold text-[#0F172A] outline-none"
                />
              </label>
              <label className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2 py-2">
                <span className="block text-[10px] font-bold text-[#64748B] mb-1">Repetições</span>
                <input
                  type="number"
                  min={1}
                  value={pendingReps}
                  onChange={(e) => setPendingReps(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-[#DBEAFE] bg-white px-2 py-1.5 text-[12px] font-bold text-[#0F172A] outline-none"
                />
              </label>
              <label className="rounded-xl border border-[#DBEAFE] bg-[#F8FAFF] px-2 py-2">
                <span className="block text-[10px] font-bold text-[#64748B] mb-1">Quilogramas</span>
                <input
                  type="number"
                  min={0}
                  value={pendingWeight}
                  onChange={(e) => setPendingWeight(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-[#DBEAFE] bg-white px-2 py-1.5 text-[12px] font-bold text-[#0F172A] outline-none"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeExerciseConfig}
                className="py-2.5 rounded-xl border border-[#DBEAFE] bg-white text-[#1D4ED8] font-black text-[12px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmExerciseConfig}
                className="py-2.5 rounded-xl bg-[#2563EB] text-white font-black text-[12px]"
              >
                Salvar e Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-[420px] mx-auto px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-transparent">
          {step < WIZARD_STEPS.length - 1 ? (
            <div className="grid grid-cols-[108px_1fr] gap-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className={`py-3.5 rounded-2xl font-black text-[13px] tracking-wide border flex items-center justify-center gap-1 ${
                  step === 0
                    ? "border-[#E2E8F0] bg-[#F8FAFF] text-[#94A3B8]"
                    : "border-[#BFDBFE] bg-white text-[#1D4ED8]"
                }`}
              >
                <Undo2 size={14} />
                Voltar
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[16px] tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                Próximo
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[108px_1fr] gap-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="py-3.5 rounded-2xl font-black text-[13px] tracking-wide border border-[#BFDBFE] bg-white text-[#1D4ED8] flex items-center justify-center gap-1"
              >
                <Undo2 size={14} />
                Editar
              </button>
              <button
                type="button"
                onClick={finishAndKeepEditing}
                className="py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[16px] tracking-wide flex items-center justify-center gap-2 transition-all"
              >
                Montar Treino
                <Check size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

