import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock3,
  Flame,
  HeartPulse,
  Plus,
  Scale,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type Exercise,
  type MuscleGroup,
  type WorkoutDay,
  defaultWorkoutProgram,
  saveCustomProgram,
} from "@/lib/workoutData";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Glúteo",
  "Pernas",
  "Costas",
  "Bíceps",
  "Ombro",
  "Peito",
  "Tríceps",
  "Posterior",
  "Abdômen",
  "Cardio",
];

const DAY_OPTIONS: { id: string; label: string; shortLabel: string; dayOfWeek: number }[] = [
  { id: "dom", label: "Domingo", shortLabel: "DOM", dayOfWeek: 0 },
  { id: "seg", label: "Segunda-feira", shortLabel: "SEG", dayOfWeek: 1 },
  { id: "ter", label: "Terça-feira", shortLabel: "TER", dayOfWeek: 2 },
  { id: "qua", label: "Quarta-feira", shortLabel: "QUA", dayOfWeek: 3 },
  { id: "qui", label: "Quinta-feira", shortLabel: "QUI", dayOfWeek: 4 },
  { id: "sex", label: "Sexta-feira", shortLabel: "SEX", dayOfWeek: 5 },
  { id: "sab", label: "Sábado", shortLabel: "SAB", dayOfWeek: 6 },
];

const TRAINING_GOALS = ["Hipertrofia", "Emagrecimento", "Resistência", "Condicionamento"] as const;
const TRAINING_LEVELS = ["Iniciante", "Intermediário", "Avançado"] as const;
const TRAINING_SPLITS = ["Full Body", "AB / ABC", "ABCDEF"] as const;
const TRAINING_DURATIONS = [30, 45, 60] as const;
const EXERCISE_SUGGESTIONS: { name: string; muscleGroup: MuscleGroup; image: string }[] = [
  {
    name: "Supino",
    muscleGroup: "Peito",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Agachamento",
    muscleGroup: "Pernas",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Remada",
    muscleGroup: "Costas",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Abdominais",
    muscleGroup: "Abdômen",
    image:
      "https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=400&q=80",
  },
];

function toWeekOrder(dayOfWeek: number) {
  return dayOfWeek === 0 ? 7 : dayOfWeek; // domingo no final
}

function sortByWeekOrder(a: WorkoutDay, b: WorkoutDay) {
  return toWeekOrder(a.dayOfWeek) - toWeekOrder(b.dayOfWeek);
}

function createEmptyDay(base: (typeof DAY_OPTIONS)[number]): WorkoutDay {
  return {
    id: base.id,
    dayOfWeek: base.dayOfWeek,
    label: base.label,
    shortLabel: base.shortLabel,
    name: "",
    muscleGroups: [],
    exercises: [],
    isRestDay: false,
    color:
      defaultWorkoutProgram.find((d) => d.dayOfWeek === base.dayOfWeek)?.color ?? "#2563EB",
  };
}

function generateExerciseId(name: string, index: number) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `exercise-${index}`
  );
}

function goalIcon(goal: (typeof TRAINING_GOALS)[number]) {
  if (goal === "Hipertrofia") return Flame;
  if (goal === "Emagrecimento") return Scale;
  if (goal === "Resistência") return HeartPulse;
  return Timer;
}

export default function ProgramBuilderPage() {
  const [, setLocation] = useLocation();

  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [goal, setGoal] = useState<(typeof TRAINING_GOALS)[number]>("Hipertrofia");
  const [level, setLevel] = useState<(typeof TRAINING_LEVELS)[number]>("Intermediário");
  const [split, setSplit] = useState<(typeof TRAINING_SPLITS)[number]>("AB / ABC");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState<(typeof TRAINING_DURATIONS)[number]>(45);

  useEffect(() => {
    setDays((prev) => {
      const sorted = [...prev].sort(sortByWeekOrder);
      if (sorted.length <= daysPerWeek) return sorted;
      return sorted.slice(0, daysPerWeek);
    });
  }, [daysPerWeek]);

  useEffect(() => {
    setSelectedDayId((prev) => {
      if (!prev) return prev;
      return days.some((d) => d.id === prev) ? prev : null;
    });
  }, [days]);

  function upsertDayAndSelect(base: (typeof DAY_OPTIONS)[number]) {
    setDays((prev) => {
      const existing = prev.find((d) => d.id === base.id);
      if (existing) return prev;
      if (prev.length >= daysPerWeek) {
        toast("Limite de dias atingido", {
          description: `Você selecionou ${daysPerWeek} dia(s) por semana. Remova um dia para adicionar outro.`,
        });
        return prev;
      }
      return [...prev, createEmptyDay(base)].sort(sortByWeekOrder);
    });
    setSelectedDayId(base.id);
  }

  function removeDay(id: string) {
    setDays((prev) => prev.filter((d) => d.id !== id));
    setSelectedDayId((prev) => (prev === id ? null : prev));
  }

  function updateDay(id: string, patch: Partial<WorkoutDay>) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function toggleDayMuscleGroup(dayId: string, muscleGroup: MuscleGroup) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const exists = d.muscleGroups.includes(muscleGroup);
        return {
          ...d,
          muscleGroups: exists
            ? d.muscleGroups.filter((g) => g !== muscleGroup)
            : [...d.muscleGroups, muscleGroup],
        };
      }),
    );
  }

  function addExercise(dayId: string) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const index = d.exercises.length;
        const defaultMuscleGroup = d.muscleGroups[0] ?? "Pernas";
        const newExercise: Exercise = {
          id: generateExerciseId(`Exercicio-${index + 1}`, index),
          name: `Exercício ${index + 1}`,
          muscleGroup: defaultMuscleGroup,
          defaultSets: 3,
          defaultReps: 10,
          defaultWeight: 0,
        };
        return { ...d, exercises: [...d.exercises, newExercise] };
      }),
    );
  }

  function addSuggestedExercise(dayId: string, suggestion: (typeof EXERCISE_SUGGESTIONS)[number]) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const index = d.exercises.length;
        const newExercise: Exercise = {
          id: generateExerciseId(`${suggestion.name}-${index + 1}`, index),
          name: suggestion.name,
          muscleGroup: suggestion.muscleGroup,
          defaultSets: 3,
          defaultReps: 10,
          defaultWeight: 0,
        };
        return { ...d, exercises: [...d.exercises, newExercise] };
      }),
    );
  }

  function updateExercise(dayId: string, exerciseId: string, patch: Partial<Exercise>) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          exercises: d.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, ...patch } : ex,
          ),
        };
      }),
    );
  }

  function removeExercise(dayId: string, exerciseId: string) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        return { ...d, exercises: d.exercises.filter((ex) => ex.id !== exerciseId) };
      }),
    );
  }

  function handleSave() {
    const sanitized = days
      .map((d) => ({
        ...d,
        name: d.name.trim() || `Treino ${toWeekOrder(d.dayOfWeek)} - ${goal}`,
        muscleGroups: (d.muscleGroups.length > 0
          ? d.muscleGroups
          : Array.from(new Set(d.exercises.map((ex) => ex.muscleGroup)))) as MuscleGroup[],
      }))
      .filter((d) => d.exercises.length > 0);

    if (sanitized.length === 0) {
      toast("Programa vazio", {
        description: "Adicione pelo menos um dia com exercícios antes de salvar.",
      });
      return;
    }

    saveCustomProgram(sanitized);
    toast("Programa salvo!", {
      description: `${goal} - ${level} - ${split} - ${durationMinutes} min. Seu programa será usado no app.`,
    });
    setLocation("/");
  }

  const orderedDays = [...days].sort(sortByWeekOrder);
  const orderedDayOptions = [...DAY_OPTIONS].sort(
    (a, b) => toWeekOrder(a.dayOfWeek) - toWeekOrder(b.dayOfWeek),
  );
  const selectedDay = orderedDays.find((d) => d.id === selectedDayId) ?? null;
  const selectedDayIndex = selectedDay
    ? orderedDays.findIndex((d) => d.id === selectedDay.id) + 1
    : null;

  return (
    <div className="min-h-screen bg-[#EAF2FF] pb-24">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="rounded-[28px] border border-[#1E3A8A]/20 bg-[#0A1630] text-white shadow-[0_20px_40px_rgba(15,23,42,0.35)] overflow-hidden">
          <div className="px-4 py-4 flex items-center gap-2 border-b border-white/10">
            <button
              onClick={() => setLocation("/")}
              className="p-2 rounded-full hover:bg-white/10 text-[#93C5FD] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-[24px] font-black leading-none">Personalizar Treino</h1>
            </div>
            <div className="w-9" />
          </div>

          <div className="p-4 space-y-4">
            <section>
              <p className="text-[13px] font-extrabold mb-2">Objetivo do Treino</p>
              <div className="grid grid-cols-4 gap-2">
                {TRAINING_GOALS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    className={`rounded-lg border px-2 py-2.5 text-[11px] font-bold transition-colors ${
                      goal === item
                        ? "bg-[#2563EB] text-white border-[#60A5FA]"
                        : "bg-white/5 text-[#DBEAFE] border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {(() => {
                        const Icon = goalIcon(item);
                        return <Icon size={16} />;
                      })()}
                      <span className="leading-tight">{item}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[13px] font-extrabold mb-2">Nível de Treino</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
                {TRAINING_LEVELS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    className={`rounded-md px-2 py-2 text-[12px] font-bold transition-colors ${
                      level === item
                        ? "bg-[#2563EB] text-white shadow-[0_6px_16px_rgba(37,99,235,0.45)]"
                        : "text-[#DBEAFE] hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[13px] font-extrabold mb-2">Divisão de Treino</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1">
                {TRAINING_SPLITS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSplit(item)}
                    className={`rounded-md px-2 py-2 text-[12px] font-bold transition-colors ${
                      split === item
                        ? "bg-[#2563EB] text-white shadow-[0_6px_16px_rgba(37,99,235,0.45)]"
                        : "text-[#DBEAFE] hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-extrabold">Dias por Semana</p>
                <span className="text-[16px] font-black text-[#93C5FD]">{daysPerWeek} dias</span>
              </div>
              <input
                type="range"
                min={2}
                max={6}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
              <div className="mt-2 flex justify-between">
                {[2, 3, 4, 5, 6].map((item) => (
                  <span
                    key={item}
                    className={`h-6 w-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      item === daysPerWeek
                        ? "bg-[#2563EB] text-white"
                        : "bg-white/10 text-[#93A8C7]"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[13px] font-extrabold mb-2">Montagem por Dia</p>
              <div className="space-y-2">
                {orderedDayOptions.map((dayOption) => {
                  const active = days.some((d) => d.id === dayOption.id);
                  const selected = selectedDayId === dayOption.id;
                  return (
                    <div
                      key={dayOption.id}
                      className={`rounded-lg border px-3 py-2 flex items-center justify-between ${
                        selected
                          ? "border-[#3B82F6] bg-[#1E3A8A]/35"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => active && setSelectedDayId(dayOption.id)}
                        className={`text-left ${active ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <p className="text-[10px] font-black text-[#93C5FD]">{dayOption.shortLabel}</p>
                        <p className="text-[12px] font-semibold text-white">{dayOption.label}</p>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {active && (
                          <button
                            type="button"
                            onClick={() => removeDay(dayOption.id)}
                            className="h-8 w-8 rounded-md border border-white/10 bg-white/10 text-[#BFDBFE] hover:bg-white/20 flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => upsertDayAndSelect(dayOption)}
                          className={`h-8 px-3 rounded-md text-[11px] font-bold border transition-colors ${
                            active
                              ? "bg-[#1E3A8A] border-[#3B82F6] text-[#BFDBFE] hover:bg-[#1D4ED8]"
                              : "bg-[#2563EB] border-[#3B82F6] text-white hover:bg-[#1D4ED8]"
                          }`}
                        >
                          {active ? "Editar" : "+ Treino"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {selectedDay && (
              <motion.section
                key={selectedDay.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#3B82F6]/40 bg-[#0F2346] p-3 space-y-3"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-[#93A8C7]">
                    {selectedDay.label} - Treino {selectedDayIndex}
                  </p>
                  <input
                    type="text"
                    className="mt-1 w-full bg-transparent text-[14px] font-black text-white border-b border-white/20 focus:border-[#60A5FA] outline-none pb-1"
                    placeholder={`Treino ${selectedDayIndex} - ${goal}`}
                    value={selectedDay.name}
                    onChange={(e) => updateDay(selectedDay.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#BFDBFE] mb-2">Categoria do treino</p>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map((group) => {
                      const isSelected = selectedDay.muscleGroups.includes(group);
                      return (
                        <button
                          key={`${selectedDay.id}-${group}`}
                          type="button"
                          onClick={() => toggleDayMuscleGroup(selectedDay.id, group)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            isSelected
                              ? "bg-[#2563EB] border-[#3B82F6] text-white"
                              : "bg-white/10 border-white/10 text-[#BFDBFE] hover:bg-white/20"
                          }`}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#BFDBFE] mb-2">Escolha os Exercícios</p>
                  <div className="grid grid-cols-4 gap-2">
                    {EXERCISE_SUGGESTIONS.map((item) => (
                      <button
                        key={`${selectedDay.id}-${item.name}`}
                        type="button"
                        onClick={() => addSuggestedExercise(selectedDay.id, item)}
                        className="rounded-lg overflow-hidden border border-white/10 bg-[#1E3A8A]/30 hover:bg-[#1E3A8A]/45 transition-colors"
                      >
                        <div
                          className="h-14 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${item.image})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1630]/80 to-transparent" />
                        </div>
                        <div className="px-1 py-1 text-[10px] font-semibold text-[#DBEAFE] truncate">
                          {item.name}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addExercise(selectedDay.id)}
                    className="mt-2 w-full py-2 rounded-lg bg-[#2563EB] border border-[#3B82F6] text-white text-[12px] font-bold hover:bg-[#1D4ED8] transition-colors"
                  >
                    Adicionar Exercícios
                  </button>
                </div>

                {selectedDay.exercises.length > 0 && (
                  <div className="space-y-2">
                    {selectedDay.exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="rounded-lg border border-white/10 bg-white/5 p-2.5 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#93C5FD] font-black">{idx + 1}</span>
                          <input
                            type="text"
                            className="flex-1 bg-transparent text-[12px] border-b border-white/20 focus:border-[#60A5FA] outline-none pb-1"
                            value={ex.name}
                            onChange={(e) =>
                              updateExercise(selectedDay.id, ex.id, {
                                name: e.target.value,
                                id: generateExerciseId(e.target.value, idx),
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeExercise(selectedDay.id, ex.id)}
                            className="text-[#BFDBFE] hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            min={1}
                            value={ex.defaultSets}
                            onChange={(e) =>
                              updateExercise(selectedDay.id, ex.id, {
                                defaultSets: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-[11px] outline-none focus:border-[#60A5FA]"
                            placeholder="Séries"
                          />
                          <input
                            type="number"
                            min={1}
                            value={ex.defaultReps}
                            onChange={(e) =>
                              updateExercise(selectedDay.id, ex.id, {
                                defaultReps: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-[11px] outline-none focus:border-[#60A5FA]"
                            placeholder="Reps"
                          />
                          <input
                            type="number"
                            min={0}
                            value={ex.defaultWeight}
                            onChange={(e) =>
                              updateExercise(selectedDay.id, ex.id, {
                                defaultWeight: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-[11px] outline-none focus:border-[#60A5FA]"
                            placeholder="Kg"
                          />
                        </div>
                        <select
                          className="w-full rounded-md bg-white/10 border border-white/10 px-2 py-1 text-[11px] outline-none focus:border-[#60A5FA]"
                          value={ex.muscleGroup}
                          onChange={(e) =>
                            updateExercise(selectedDay.id, ex.id, {
                              muscleGroup: e.target.value as MuscleGroup,
                            })
                          }
                        >
                          {MUSCLE_GROUPS.map((mg) => (
                            <option key={mg} value={mg} className="text-[#0F172A]">
                              {mg}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            <section>
              <p className="text-[13px] font-extrabold mb-2">Duração do Treino</p>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[12px] text-[#DBEAFE]">
                <Clock3 size={14} />
                <span>Tempo: {durationMinutes} min</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TRAINING_DURATIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDurationMinutes(item)}
                    className={`rounded-lg border px-2 py-2 text-[12px] font-bold transition-colors ${
                      durationMinutes === item
                        ? "bg-[#2563EB] text-white border-[#3B82F6]"
                        : "bg-white/5 text-[#DBEAFE] border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {item} min
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-black text-[18px] shadow-lg hover:shadow-xl transition-all"
            >
              Montar Treino
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

