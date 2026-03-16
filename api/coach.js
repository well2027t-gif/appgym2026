function buildCoachReply(payload = {}) {
  const message = String(payload.message || "").toLowerCase();
  const context = payload.context || {};
  const name = String(context.profileName || "Ana").trim() || "Ana";
  const workout = context.workoutName || "seu treino";
  const weeklyGoal = context.weeklyWorkoutCount || 4;

  if (message.includes("motiva")) {
    return {
      provider: "vercel-mock",
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

  if (message.includes("aquec")) {
    return {
      provider: "vercel-mock",
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

  if (message.includes("adapt") || message.includes("trocar")) {
    return {
      provider: "vercel-mock",
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
    provider: "vercel-mock",
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

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo nao permitido" });
    return;
  }

  res.status(200).json(buildCoachReply(req.body || {}));
}

