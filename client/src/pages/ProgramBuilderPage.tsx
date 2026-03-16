import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  type Exercise,
  type MuscleGroup,
  type WorkoutDay,
  defaultWorkoutProgram,
  getActiveWorkoutProgram,
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
      defaultWorkoutProgram.find((d) => d.dayOfWeek === base.dayOfWeek)?.color ?? "#E85B9C",
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

export default function ProgramBuilderPage() {
  const [, setLocation] = useLocation();
  const existingProgram = getActiveWorkoutProgram();

  const [days, setDays] = useState<WorkoutDay[]>(() => {
    // Começa a partir do programa ativo, mas sem dias de descanso
    return existingProgram
      .filter((d) => !d.isRestDay)
      .map((d) => ({ ...d }));
  });

  function upsertDay(base: (typeof DAY_OPTIONS)[number]) {
    setDays((prev) => {
      const existing = prev.find((d) => d.id === base.id);
      if (existing) return prev;
      return [...prev, createEmptyDay(base)];
    });
  }

  function removeDay(id: string) {
    setDays((prev) => prev.filter((d) => d.id !== id));
  }

  function updateDay(id: string, patch: Partial<WorkoutDay>) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function addExercise(dayId: string) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const index = d.exercises.length;
        const newExercise: Exercise = {
          id: generateExerciseId("Novo Exercício", index),
          name: "Novo Exercício",
          muscleGroup: "Pernas",
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
        name: d.name.trim() || d.label,
        muscleGroups: Array.from(
          new Set(d.exercises.map((ex) => ex.muscleGroup)),
        ) as MuscleGroup[],
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
      description: "Seu programa personalizado será usado nas telas de Home, Treino e Dashboard.",
    });
    setLocation("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6F0] via-[#F0E8F0] to-[#E8D5E8] text-[#2D1B3D] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-full hover:bg-[#F5E6F0] text-[#E85B9C] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-base font-black">Montar Programa</h1>
            <p className="text-[11px] text-[#7D5B8D]">
              Personalize os dias de treino e exercícios
            </p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Dia da semana selector */}
        <div className="bg-white/80 rounded-2xl p-4 shadow-sm border border-white/60">
          <p className="text-xs font-bold text-[#7D5B8D] uppercase tracking-widest mb-3">
            Dias da Semana
          </p>
          <div className="grid grid-cols-4 gap-2">
            {DAY_OPTIONS.map((day) => {
              const active = days.some((d) => d.id === day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => upsertDay(day)}
                  className={`text-xs font-bold py-2 rounded-xl border transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#E85B9C] to-[#D946A6] text-white border-transparent"
                      : "bg-white text-[#7D5B8D] border-[#E5D4EA] hover:bg-[#F5E6F0]"
                  }`}
                >
                  {day.shortLabel}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#A18BB5] mt-2">
            Toque em um dia para adicioná-lo ao seu programa. Ele aparecerá abaixo para edição.
          </p>
        </div>

        {/* Days editor */}
        <div className="space-y-4">
          {days.map((day) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md border border-[#E5D4EA] overflow-hidden"
            >
              <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#E85B9C]/10 to-[#D946A6]/5 border-b border-[#E5D4EA]">
                <div>
                  <p className="text-xs font-semibold text-[#A18BB5] uppercase tracking-widest">
                    {day.label}
                  </p>
                  <input
                    type="text"
                    className="mt-0.5 text-sm font-black text-[#2D1B3D] bg-transparent border-none p-0 outline-none"
                    placeholder="Nome do treino (ex: Glúteo + Pernas)"
                    value={day.name}
                    onChange={(e) => updateDay(day.id, { name: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => removeDay(day.id)}
                  className="p-1.5 rounded-full hover:bg-[#F5E6F0] text-[#E85B9C] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="px-4 py-4 space-y-3">
                {day.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="bg-[#F8F2FB] rounded-xl p-3 border border-[#E5D4EA] flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#E85B9C] w-4">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        className="flex-1 text-sm font-semibold text-[#2D1B3D] bg-transparent border-b border-transparent focus:border-[#E85B9C] outline-none pb-0.5"
                        placeholder="Nome do exercício"
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(day.id, ex.id, {
                            name: e.target.value,
                            id: generateExerciseId(e.target.value, idx),
                          })
                        }
                      />
                      <button
                        onClick={() => removeExercise(day.id, ex.id)}
                        className="p-1 rounded-full hover:bg-white text-[#E85B9C] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          className="w-14 text-xs text-center bg-white rounded-lg border border-[#E5D4EA] px-1.5 py-1 outline-none focus:border-[#E85B9C]"
                          value={ex.defaultSets}
                          onChange={(e) =>
                            updateExercise(day.id, ex.id, {
                              defaultSets: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                        <span className="text-[11px] text-[#7D5B8D]">séries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          className="w-14 text-xs text-center bg-white rounded-lg border border-[#E5D4EA] px-1.5 py-1 outline-none focus:border-[#E85B9C]"
                          value={ex.defaultReps}
                          onChange={(e) =>
                            updateExercise(day.id, ex.id, {
                              defaultReps: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                        <span className="text-[11px] text-[#7D5B8D]">reps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          className="w-16 text-xs text-center bg-white rounded-lg border border-[#E5D4EA] px-1.5 py-1 outline-none focus:border-[#E85B9C]"
                          value={ex.defaultWeight}
                          onChange={(e) =>
                            updateExercise(day.id, ex.id, {
                              defaultWeight: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                        />
                        <span className="text-[11px] text-[#7D5B8D]">kg</span>
                      </div>
                    </div>

                    <div>
                      <select
                        className="w-full text-[11px] bg-white rounded-lg border border-[#E5D4EA] px-2 py-1.5 text-[#7D5B8D] outline-none focus:border-[#E85B9C]"
                        value={ex.muscleGroup}
                        onChange={(e) =>
                          updateExercise(day.id, ex.id, {
                            muscleGroup: e.target.value as MuscleGroup,
                          })
                        }
                      >
                        {MUSCLE_GROUPS.map((mg) => (
                          <option key={mg} value={mg}>
                            {mg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addExercise(day.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border border-dashed border-[#E5D4EA] text-[#E85B9C] bg-[#FDF8FF] hover:bg-[#F8F0FB] transition-colors"
                >
                  <Plus size={14} />
                  Adicionar exercício
                </button>
              </div>
            </motion.div>
          ))}

          {days.length === 0 && (
            <p className="text-xs text-[#7D5B8D] text-center">
              Escolha acima os dias que você quer treinar para começar a montar seu programa.
            </p>
          )}
        </div>

        {/* Save button */}
        <div className="pt-2 pb-8">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E85B9C] to-[#D946A6] text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            Salvar programa personalizado
          </button>
        </div>
      </div>
    </div>
  );
}

