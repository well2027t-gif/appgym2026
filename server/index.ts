import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CoachContext = {
  profileName?: string;
  workoutName?: string;
  completedToday?: boolean;
  weeklyWorkoutCount?: number;
};

type CoachRequest = {
  message?: string;
  context?: CoachContext;
};

function buildCoachReply({ message = "", context = {} }: CoachRequest) {
  const normalized = message.toLowerCase();
  const name = context.profileName?.trim() || "Ana";
  const workout = context.workoutName || "seu treino";
  const weeklyGoal = context.weeklyWorkoutCount || 4;

  if (normalized.includes("motiva")) {
    return {
      title: "Motivação para hoje",
      answer: `${name}, foque em fazer o básico muito bem. Um treino consistente de ${workout} já conta como vitória do dia.`,
      tips: [
        "Comece com 5 minutos de aquecimento.",
        "Pense só no treino de hoje, não na semana inteira.",
        "Finalize pelo menos o bloco principal do treino.",
      ],
      quickReplies: ["Me dá uma meta de hoje", "Como aquecer melhor?", "Quero adaptar meu treino"],
    };
  }

  if (normalized.includes("aquecer") || normalized.includes("aquec")) {
    return {
      title: "Aquecimento sugerido",
      answer: `Antes de ${workout}, faça um aquecimento curto para ativar o corpo sem gastar energia demais.`,
      tips: [
        "3 a 5 minutos de cardio leve.",
        "1 série leve de cada primeiro exercício.",
        "Mobilidade do grupo muscular principal do treino.",
      ],
      quickReplies: ["Quero treinar melhor hoje", "Me motiva", "Como adaptar meu treino?"],
    };
  }

  if (normalized.includes("adapt") || normalized.includes("trocar")) {
    return {
      title: "Adaptação rápida de treino",
      answer: `Se hoje ${workout} estiver pesado demais, mantenha o foco no grupo principal e reduza volume em vez de pular o treino.`,
      tips: [
        "Troque exercício complexo por máquina equivalente.",
        "Reduza 1 série dos exercícios acessórios.",
        "Mantenha boa execução e termine o treino principal.",
      ],
      quickReplies: ["Qual meta da semana?", "Me motiva", "Quero aquecimento rápido"],
    };
  }

  return {
    title: "Coach TAI",
    answer: `${name}, hoje seu foco é ${workout}. Tente bater sua meta semanal de ${weeklyGoal} dias com consistência, não perfeição.`,
    tips: [
      "Finalize o exercício principal do treino.",
      "Registre a carga ou repetições do dia.",
      "Se já treinou hoje, faça recuperação leve e hidratação.",
    ],
    quickReplies: ["Me motiva", "Como aquecer?", "Como adaptar meu treino?"],
  };
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  app.post("/api/coach", (req, res) => {
    const payload = (req.body ?? {}) as CoachRequest;
    const reply = buildCoachReply(payload);

    res.json({
      provider: process.env.COACH_TAI_PROVIDER ?? "mock",
      ...reply,
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
