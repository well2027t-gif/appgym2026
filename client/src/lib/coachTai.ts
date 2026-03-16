export type CoachTaiRequest = {
  message: string;
  context?: {
    profileName?: string;
    workoutName?: string;
    completedToday?: boolean;
    weeklyWorkoutCount?: number;
  };
};

export type CoachTaiResponse = {
  provider: string;
  title: string;
  answer: string;
  tips: string[];
  quickReplies: string[];
};

function buildLocalCoachReply(payload: CoachTaiRequest): CoachTaiResponse {
  const name = payload.context?.profileName?.trim() || "Ana";
  const workout = payload.context?.workoutName || "seu treino";
  const text = payload.message.toLowerCase();

  if (text.includes("aquec")) {
    return {
      provider: "local-fallback",
      title: "Aquecimento rápido",
      answer: `${name}, faça um aquecimento curto antes de ${workout} para ativar o corpo e melhorar a execução.`,
      tips: [
        "3 a 5 minutos de cardio leve.",
        "1 série leve do primeiro exercício.",
        "Mobilidade do grupo muscular principal.",
      ],
      quickReplies: ["Me motiva", "Como adaptar meu treino?", "Qual meta de hoje?"],
    };
  }

  if (text.includes("adapt")) {
    return {
      provider: "local-fallback",
      title: "Adaptação do treino",
      answer: `Se hoje ${workout} estiver pesado, reduza o volume e mantenha o exercício principal do dia.`,
      tips: [
        "Troque exercícios complexos por máquina equivalente.",
        "Retire 1 série dos acessórios.",
        "Priorize boa execução.",
      ],
      quickReplies: ["Me motiva", "Como aquecer?", "Qual meta de hoje?"],
    };
  }

  return {
    provider: "local-fallback",
    title: "Coach TAI",
    answer: `${name}, foque no treino de hoje: ${workout}. Consistência vale mais do que perfeição.`,
    tips: [
      "Comece pelo exercício principal.",
      "Registre sua evolução no treino.",
      "Se terminar cansada, valorize o progresso do dia.",
    ],
    quickReplies: ["Me motiva", "Como aquecer?", "Como adaptar meu treino?"],
  };
}

export async function askCoachTai(payload: CoachTaiRequest): Promise<CoachTaiResponse> {
  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Falha no endpoint do Coach TAI.");
    }

    return response.json() as Promise<CoachTaiResponse>;
  } catch {
    return buildLocalCoachReply(payload);
  }
}

