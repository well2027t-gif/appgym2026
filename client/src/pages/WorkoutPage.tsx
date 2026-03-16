// GymTracker — Workout Page (Professional & Polished)
// Design: Modern, clean, professional interface with smooth interactions

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Dumbbell, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import {
  type Exercise,
  type ProgressEntry,
  type Set,
  defaultWorkoutProgram,
  getProgressForExercise,
  getTodayISO,
  isWorkoutCompleted,
  markWorkoutCompleted,
  saveProgressLog,
} from "@/lib/workoutData";

interface ExerciseState {
  exerciseId: string;
  sets: Set[];
  expanded: boolean;
}

function buildInitialSets(exercise: Exercise, lastLog?: ProgressEntry): Set[] {
  const count = exercise.defaultSets;
  return Array.from({ length: count }, (_, i) => ({
    reps: lastLog?.sets[i]?.reps ?? exercise.defaultReps,
    weight: lastLog?.sets[i]?.weight ?? exercise.defaultWeight,
    completed: false,
  }));
}

export default function WorkoutPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const [, setLocation] = useLocation();

  const day = defaultWorkoutProgram.find(d => d.id === dayId);
  const todayISO = getTodayISO();
  const alreadyCompleted = day ? isWorkoutCompleted(day.id, todayISO) : false;

  const [exerciseStates, setExerciseStates] = useState<ExerciseState[]>([]);
  const [workoutDone, setWorkoutDone] = useState(alreadyCompleted);

  useEffect(() => {
    if (!day) return;
    const states: ExerciseState[] = day.exercises.map((ex, idx) => {
      const logs = getProgressForExercise(ex.id);
      const lastLog = logs.length > 0 ? logs[logs.length - 1] : undefined;
      return {
        exerciseId: ex.id,
        sets: buildInitialSets(ex, lastLog),
        expanded: idx === 0,
      };
    });
    setExerciseStates(states);
  }, [day]);

  if (!day) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF] flex items-center justify-center text-[#0F172A]">
        <p>Treino não encontrado.</p>
      </div>
    );
  }

  const totalSets = exerciseStates.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = exerciseStates.reduce(
    (a, e) => a + e.sets.filter(s => s.completed).length,
    0,
  );
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  function toggleExpand(exerciseId: string) {
    setExerciseStates(prev =>
      prev.map(e => (e.exerciseId === exerciseId ? { ...e, expanded: !e.expanded } : e)),
    );
  }

  function updateSet(exerciseId: string, setIdx: number, field: "reps" | "weight", value: string) {
    const numValue = parseFloat(value) || 0;
    setExerciseStates(prev =>
      prev.map(e => {
        if (e.exerciseId !== exerciseId) return e;
        const newSets = e.sets.map((s, i) => {
          if (i !== setIdx) return s;
          return { ...s, [field]: Math.max(0, numValue) };
        });
        return { ...e, sets: newSets };
      }),
    );
  }

  function toggleSetComplete(exerciseId: string, setIdx: number) {
    setExerciseStates(prev =>
      prev.map(e => {
        if (e.exerciseId !== exerciseId) return e;
        const newSets = e.sets.map((s, i) =>
          i === setIdx ? { ...s, completed: !s.completed } : s,
        );
        return { ...e, sets: newSets };
      }),
    );
  }

  function finishWorkout() {
    if (!day) return;
    // Verifica se existe pelo menos uma série concluída antes de finalizar
    const hasAnyCompletedSet = exerciseStates.some(es => es.sets.some(s => s.completed));

    if (!hasAnyCompletedSet) {
      toast("Nenhuma série concluída", {
        description: "Marque pelo menos uma série como concluída antes de finalizar o treino.",
      });
      return;
    }

    exerciseStates.forEach(es => {
      const exercise = day.exercises.find(ex => ex.id === es.exerciseId);
      if (!exercise) return;
      const completedSetsList = es.sets.filter(s => s.completed);
      if (completedSetsList.length === 0) return;
      const totalVolume = completedSetsList.reduce((a, s) => a + s.reps * s.weight, 0);
      const maxWeight = Math.max(...completedSetsList.map(s => s.weight));
      const entry: ProgressEntry = {
        date: todayISO,
        exerciseId: es.exerciseId,
        sets: es.sets,
        totalVolume,
        maxWeight,
      };
      saveProgressLog(entry);
    });

    markWorkoutCompleted(day.id, todayISO);
    setWorkoutDone(true);
    // Don't show toast, show celebration screen instead
  }

  // Get next workout day
  const getNextWorkoutDay = () => {
    if (!day) return null;
    const currentIndex = defaultWorkoutProgram.findIndex(d => d.id === dayId);
    const nextIndex = (currentIndex + 1) % defaultWorkoutProgram.length;
    return defaultWorkoutProgram[nextIndex];
  };

  // Confetti component
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
    }));

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map(piece => (
          <motion.div
            key={piece.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${piece.left}%`,
              top: "-10px",
              backgroundColor: ["#2563EB", "#1D4ED8", "#EEF5FF", "#64748B"][
                Math.floor(Math.random() * 4)
              ],
            }}
            animate={{
              y: window.innerHeight + 20,
              x: (Math.random() - 0.5) * 200,
              rotate: Math.random() * 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </div>
    );
  };

  if (workoutDone && day) {
    const nextDay = getNextWorkoutDay();
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EEF5FF] via-[#E7F0FF] to-[#DCEBFF] flex items-center justify-center">
        <Confetti />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="text-center px-4 max-w-md"
        >
          {/* Trophy Icon */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            🏆
          </motion.div>

          {/* Congratulations Text */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-[#0F172A] mb-2"
          >
            Parabéns!
          </motion.h1>

          {/* Completion Message */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-[#64748B] mb-6"
          >
            Você completou o treino de <span className="font-bold text-[#2563EB]">{day.name}</span>{" "}
            com sucesso! 💪
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 backdrop-blur rounded-2xl p-6 mb-8 border border-white/30"
          >
            <p className="text-sm text-[#64748B] mb-2">Próximo treino:</p>
            <p className="text-2xl font-black text-[#2563EB]">{nextDay?.name || "Descanso"}</p>
            {nextDay && <p className="text-xs text-[#64748B] mt-2">{nextDay.label}</p>}
          </motion.div>

          {/* Close Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation("/")}
            className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Voltar para Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF5FF] via-[#E7F0FF] to-[#DCEBFF] text-[#0F172A] pb-32">
      {/* Header with Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#2563EB]/10"
      >
        <div className="px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-[#EEF5FF] rounded-full transition-colors text-[#2563EB]"
            >
              <ArrowLeft size={22} />
            </motion.button>
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Dumbbell size={18} className="text-[#2563EB]" />
                <h1 className="font-black text-lg text-[#0F172A]">{day.name}</h1>
              </div>
              <p className="text-xs font-semibold text-[#64748B]">{day.label}</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="px-4 pb-2 max-w-2xl mx-auto">
          <div className="bg-white/50 backdrop-blur rounded-full p-0 shadow-sm border border-white/10">
            <div className="h-1 bg-gradient-to-r from-[#EEF5FF] to-[#DCEBFF] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exercise List */}
      <div className="px-4 mt-6 max-w-2xl mx-auto space-y-3 pb-4">
        <AnimatePresence>
          {day.exercises.map((exercise, exIdx) => {
            const state = exerciseStates.find(e => e.exerciseId === exercise.id);
            if (!state) return null;
            const allCompleted = state.sets.every(s => s.completed);
            const completedCount = state.sets.filter(s => s.completed).length;

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: exIdx * 0.05 }}
                className={`rounded-2xl overflow-hidden transition-all border-2 ${
                  allCompleted
                    ? "bg-gradient-to-br from-[#2563EB]/10 to-[#1D4ED8]/5 border-[#2563EB]/40 shadow-md"
                    : "bg-white/70 border-white/40 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Exercise Header - Entire header is clickable */}
                <div
                  className="w-full px-5 py-4 flex items-center gap-3 text-left transition-colors cursor-pointer hover:bg-[#2563EB]/5"
                  onClick={() => toggleExpand(exercise.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-black text-base ${allCompleted ? "text-[#2563EB]" : "text-[#0F172A]"}`}
                      >
                        {exercise.name}
                      </p>
                      {allCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 bg-[#2563EB]/20 rounded-full"
                        >
                          <CheckCircle2 size={14} className="text-[#2563EB]" />
                          <span className="text-xs font-bold text-[#2563EB]">Feito</span>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      <span className="font-semibold">
                        {state.sets.length}x{exercise.defaultReps}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{exercise.muscleGroup}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2563EB]">
                        {completedCount}/{state.sets.length}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: state.expanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={18} className="text-[#2563EB]" />
                    </motion.div>
                  </div>
                </div>

                {/* Sets */}
                <AnimatePresence>
                  {state.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-white/30 px-5 py-4 space-y-2.5 bg-white/40"
                    >
                      {state.sets.map((set, setIdx) => (
                        <motion.div
                          key={setIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: setIdx * 0.05 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            set.completed
                              ? "bg-gradient-to-r from-[#2563EB]/20 to-[#1D4ED8]/10 border border-[#2563EB]/30"
                              : "bg-white/60 border border-white/40 hover:bg-white/80"
                          }`}
                        >
                          {/* Set Number */}
                          <div
                            className={`font-black text-sm w-8 h-8 flex items-center justify-center rounded-lg ${
                              set.completed
                                ? "bg-[#2563EB] text-white"
                                : "bg-white/50 text-[#64748B]"
                            }`}
                          >
                            {setIdx + 1}
                          </div>

                          {/* Weight Input */}
                          <div className="flex items-center gap-1 relative z-10">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={e =>
                                updateSet(exercise.id, setIdx, "weight", e.target.value)
                              }
                              className="w-12 text-center text-xs font-bold bg-white/70 text-[#0F172A] rounded-lg px-1.5 py-1.5 outline-none border border-white/50 focus:border-[#2563EB] focus:bg-white transition-all"
                              placeholder="0"
                              inputMode="decimal"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">
                              kg
                            </span>
                          </div>

                          {/* Reps Input */}
                          <div className="flex items-center gap-1 relative z-10">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={e => updateSet(exercise.id, setIdx, "reps", e.target.value)}
                              className="w-12 text-center text-xs font-bold bg-white/70 text-[#0F172A] rounded-lg px-1.5 py-1.5 outline-none border border-white/50 focus:border-[#2563EB] focus:bg-white transition-all"
                              placeholder="0"
                              inputMode="numeric"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">
                              reps
                            </span>
                          </div>

                          {/* Complete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={e => {
                              e.stopPropagation();
                              toggleSetComplete(exercise.id, setIdx);
                            }}
                            className={`ml-auto flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all font-bold relative z-10 ${
                              set.completed
                                ? "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-lg"
                                : "bg-white/50 text-[#64748B] hover:bg-white border border-white/50"
                            }`}
                          >
                            <CheckCircle2 size={18} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Finish Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-6 bg-gradient-to-t from-[#DCEBFF] via-[#DCEBFF]/80 to-transparent z-50"
      >
        <div className="max-w-2xl mx-auto">
          {workoutDone ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-center text-white font-black text-base shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Treino Concluído com Sucesso!
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(232, 91, 156, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={finishWorkout}
              disabled={completedSets === 0}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
                completedSets > 0
                  ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-xl hover:shadow-2xl"
                  : "bg-white/40 text-[#64748B] cursor-not-allowed"
              }`}
            >
              <Zap size={20} />
              Finalizar Treino ({completedSets}/{totalSets})
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="px-4 max-w-2xl mx-auto mt-8">
        <Footer />
      </div>
    </div>
  );
}
