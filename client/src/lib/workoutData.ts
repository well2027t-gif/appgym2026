// GymTracker — Workout Data & Types
// Design: Dark Athletic Premium | Space Grotesk + Inter | Green Neon #00FF87
// Programa personalizado para a amiga

export type MuscleGroup =
  | "Glúteo"
  | "Pernas"
  | "Costas"
  | "Bíceps"
  | "Ombro"
  | "Peito"
  | "Tríceps"
  | "Posterior"
  | "Abdômen"
  | "Cardio"
  | "Descanso";

export interface Set {
  reps: number;
  weight: number; // kg
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  date: string; // ISO date string
  sets: Set[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  instructions?: string;
}

export interface WorkoutDay {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  label: string;
  shortLabel: string;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
  isRestDay: boolean;
  color: string; // accent color for the day
}

// Storage key for programa customizado
const CUSTOM_PROGRAM_STORAGE_KEY = "gymtracker_custom_program_v1";

// Carrega programa customizado do localStorage (se existir e for válido)
function loadCustomProgram(): WorkoutDay[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOM_PROGRAM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutDay[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Salva programa customizado no localStorage
export function saveCustomProgram(program: WorkoutDay[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_PROGRAM_STORAGE_KEY, JSON.stringify(program));
}

// Retorna o programa ativo (customizado, se existir; caso contrário, o default)
export function getActiveWorkoutProgram(): WorkoutDay[] {
  const custom = loadCustomProgram();
  return custom ?? defaultWorkoutProgram;
}

export interface ProgressEntry {
  date: string;
  exerciseId: string;
  sets: Set[];
  totalVolume: number; // kg * reps * sets
  maxWeight: number;
  notes?: string;
}

// Programa personalizado da amiga
export const defaultWorkoutProgram: WorkoutDay[] = [
  {
    id: "seg",
    dayOfWeek: 1,
    label: "Segunda-feira",
    shortLabel: "SEG",
    name: "Glúteo + Pernas",
    muscleGroups: ["Glúteo", "Pernas"],
    isRestDay: false,
    color: "#FF6B35",
    exercises: [
      {
        id: "hip-thrust",
        name: "Hip Thrust",
        muscleGroup: "Glúteo",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "gluteo-cabo",
        name: "Glúteo no Cabo",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "abducao-maquina",
        name: "Abdução Máquina",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "coice-maquina",
        name: "Coice Máquina",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "agachamento",
        name: "Agachamento",
        muscleGroup: "Pernas",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "leg-press",
        name: "Leg Press",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "cadeira-extensora",
        name: "Cadeira Extensora",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "afundo",
        name: "Afundo",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "esteira-seg",
        name: "Esteira",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "abdominal-infra-seg",
        name: "Abdominal Infra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "ter",
    dayOfWeek: 2,
    label: "Terça-feira",
    shortLabel: "TER",
    name: "Costas + Bíceps",
    muscleGroups: ["Costas", "Bíceps"],
    isRestDay: false,
    color: "#00D4FF",
    exercises: [
      {
        id: "puxada-frente",
        name: "Puxada na Frente",
        muscleGroup: "Costas",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "remada-baixa",
        name: "Remada Baixa",
        muscleGroup: "Costas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "pulldown",
        name: "Pulldown",
        muscleGroup: "Costas",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "remada-unilateral",
        name: "Remada Unilateral",
        muscleGroup: "Costas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "rosca-direta",
        name: "Rosca Direta",
        muscleGroup: "Bíceps",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "rosca-martelo",
        name: "Rosca Martelo",
        muscleGroup: "Bíceps",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "rosca-alternada",
        name: "Rosca Alternada",
        muscleGroup: "Bíceps",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "rosca-concentrada",
        name: "Rosca Concentrada",
        muscleGroup: "Bíceps",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "bike-ter",
        name: "Bike",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "abdominal-supra-ter",
        name: "Abdominal Supra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "qua",
    dayOfWeek: 3,
    label: "Quarta-feira",
    shortLabel: "QUA",
    name: "Glúteo + Posterior",
    muscleGroups: ["Glúteo", "Posterior"],
    isRestDay: false,
    color: "#A855F7",
    exercises: [
      {
        id: "hip-thrust-qua",
        name: "Hip Thrust",
        muscleGroup: "Glúteo",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "gluteo-maquina",
        name: "Glúteo Máquina",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "coice-cabo",
        name: "Coice no Cabo",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "abducao-qua",
        name: "Abdução",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "stiff",
        name: "Stiff",
        muscleGroup: "Posterior",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "mesa-flexora",
        name: "Mesa Flexora",
        muscleGroup: "Posterior",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "good-morning",
        name: "Good Morning",
        muscleGroup: "Posterior",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "levantamento-terra",
        name: "Levantamento Terra",
        muscleGroup: "Posterior",
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 0,
      },
      {
        id: "escada-qua",
        name: "Escada",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "prancha-qua",
        name: "Prancha",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 30,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "qui",
    dayOfWeek: 4,
    label: "Quinta-feira",
    shortLabel: "QUI",
    name: "Ombro + Abdômen",
    muscleGroups: ["Ombro", "Abdômen"],
    isRestDay: false,
    color: "#FBBF24",
    exercises: [
      {
        id: "elevacao-lateral",
        name: "Elevação Lateral",
        muscleGroup: "Ombro",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "desenvolvimento",
        name: "Desenvolvimento",
        muscleGroup: "Ombro",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "elevacao-frontal",
        name: "Elevação Frontal",
        muscleGroup: "Ombro",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "remada-alta",
        name: "Remada Alta",
        muscleGroup: "Ombro",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "abdominal-infra-qui",
        name: "Abdominal Infra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "abdominal-supra-qui",
        name: "Abdominal Supra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "prancha-qui",
        name: "Prancha",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 30,
        defaultWeight: 0,
      },
      {
        id: "abdominal-bicicleta",
        name: "Abdominal Bicicleta",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "bike-qui",
        name: "Bike",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "sex",
    dayOfWeek: 5,
    label: "Sexta-feira",
    shortLabel: "SEX",
    name: "Glúteo + Pernas",
    muscleGroups: ["Glúteo", "Pernas"],
    isRestDay: false,
    color: "#EC4899",
    exercises: [
      {
        id: "hip-thrust-sex",
        name: "Hip Thrust",
        muscleGroup: "Glúteo",
        defaultSets: 4,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "gluteo-cabo-sex",
        name: "Glúteo Cabo",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "abducao-sex",
        name: "Abdução",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "coice-maquina-sex",
        name: "Coice Máquina",
        muscleGroup: "Glúteo",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "agachamento-bulgaro",
        name: "Agachamento Búlgaro",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "leg-press-sex",
        name: "Leg Press",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "cadeira-extensora-sex",
        name: "Cadeira Extensora",
        muscleGroup: "Pernas",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "panturrilha",
        name: "Panturrilha",
        muscleGroup: "Pernas",
        defaultSets: 4,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "esteira-sex",
        name: "Esteira",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "abdominal-infra-sex",
        name: "Abdominal Infra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "sab",
    dayOfWeek: 6,
    label: "Sábado",
    shortLabel: "SÁB",
    name: "Peito + Tríceps",
    muscleGroups: ["Peito", "Tríceps"],
    isRestDay: false,
    color: "#00FF87",
    exercises: [
      {
        id: "supino-maquina",
        name: "Supino Máquina",
        muscleGroup: "Peito",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "supino-inclinado",
        name: "Supino Inclinado",
        muscleGroup: "Peito",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "crucifixo-maquina",
        name: "Crucifixo Máquina",
        muscleGroup: "Peito",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "peck-deck",
        name: "Peck Deck",
        muscleGroup: "Peito",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "triceps-corda",
        name: "Tríceps Corda",
        muscleGroup: "Tríceps",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "triceps-testa",
        name: "Tríceps Testa",
        muscleGroup: "Tríceps",
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "triceps-banco",
        name: "Tríceps Banco",
        muscleGroup: "Tríceps",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "triceps-unilateral",
        name: "Tríceps Unilateral",
        muscleGroup: "Tríceps",
        defaultSets: 3,
        defaultReps: 12,
        defaultWeight: 0,
      },
      {
        id: "escada-sab",
        name: "Escada",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 15,
        defaultWeight: 0,
      },
      {
        id: "abdominal-supra-sab",
        name: "Abdominal Supra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
    ],
  },
  {
    id: "dom",
    dayOfWeek: 0,
    label: "Domingo",
    shortLabel: "DOM",
    name: "Descanso (Opcional)",
    muscleGroups: ["Descanso"],
    isRestDay: true,
    color: "#6B7280",
    exercises: [
      {
        id: "caminhada",
        name: "Caminhada",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "bike-leve",
        name: "Bike Leve",
        muscleGroup: "Cardio",
        defaultSets: 1,
        defaultReps: 10,
        defaultWeight: 0,
      },
      {
        id: "abdominal-supra-dom",
        name: "Abdominal Supra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "abdominal-infra-dom",
        name: "Abdominal Infra",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 20,
        defaultWeight: 0,
      },
      {
        id: "prancha-dom",
        name: "Prancha",
        muscleGroup: "Abdômen",
        defaultSets: 3,
        defaultReps: 30,
        defaultWeight: 0,
      },
    ],
  },
];

// Storage keys
export const STORAGE_KEYS = {
  PROGRESS_LOGS: "gymtracker_progress_logs",
  WORKOUT_PROGRAM: "gymtracker_workout_program",
  COMPLETED_WORKOUTS: "gymtracker_completed_workouts",
  LAST_RESET_WEEK: "gymtracker_last_reset_week",
};

// Helper functions
export function getTodayDayOfWeek(): number {
  return new Date().getDay();
}

export function getWeekDays(): WorkoutDay[] {
  // Return days starting from Monday
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((dow) => defaultWorkoutProgram.find((d) => d.dayOfWeek === dow)!);
}

export function saveProgressLog(log: ProgressEntry): void {
  const existing = getProgressLogs();
  existing.push(log);
  localStorage.setItem(STORAGE_KEYS.PROGRESS_LOGS, JSON.stringify(existing));
}

export function getProgressLogs(): ProgressEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getProgressForExercise(exerciseId: string): ProgressEntry[] {
  return getProgressLogs().filter((l) => l.exerciseId === exerciseId);
}

export function markWorkoutCompleted(dayId: string, date: string): void {
  const existing = getCompletedWorkouts();
  const key = `${dayId}_${date}`;
  if (!existing.includes(key)) {
    existing.push(key);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, JSON.stringify(existing));
  }
}

export function getCompletedWorkouts(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_WORKOUTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getWeekNumber(date: string): number {
  const d = new Date(date);
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function resetWeeklyWorkouts(): void {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayISO = getTodayISO();
  const currentWeek = getWeekNumber(todayISO);
  
  // Get the last reset week from storage
  const lastResetWeek = localStorage.getItem(STORAGE_KEYS.LAST_RESET_WEEK);
  
  // If it's Monday (1) and we haven't reset this week yet, reset the completed workouts
  if (dayOfWeek === 1 && lastResetWeek !== String(currentWeek)) {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_WEEK, String(currentWeek));
  }
}

export function isWorkoutCompleted(dayId: string, date: string): boolean {
  return getCompletedWorkouts().includes(`${dayId}_${date}`);
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Call this on app load to reset weekly workouts if needed
export function initializeWeeklyReset(): void {
  resetWeeklyWorkouts();
}

export function getMuscleGroupColor(group: MuscleGroup): string {
  const colors: Record<MuscleGroup, string> = {
    Glúteo: "#FF6B35",
    Pernas: "#FF6B35",
    Costas: "#00D4FF",
    Bíceps: "#00D4FF",
    Ombro: "#FBBF24",
    Peito: "#00FF87",
    Tríceps: "#00FF87",
    Posterior: "#A855F7",
    Abdômen: "#EC4899",
    Cardio: "#6B7280",
    Descanso: "#6B7280",
  };
  return colors[group] || "#00FF87";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
