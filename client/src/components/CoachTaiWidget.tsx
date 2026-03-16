import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, SendHorizonal, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { askCoachTai, type CoachTaiResponse } from "@/lib/coachTai";

type CoachTaiWidgetProps = {
  profileName?: string;
  workoutName: string;
  completedToday: boolean;
  weeklyWorkoutCount: number;
};

const DEFAULT_PROMPTS = ["Me motiva", "Como aquecer?", "Como adaptar meu treino?"];

export default function CoachTaiWidget({
  profileName,
  workoutName,
  completedToday,
  weeklyWorkoutCount,
}: CoachTaiWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<CoachTaiResponse | null>(null);

  async function handleAsk(nextMessage?: string) {
    const text = (nextMessage ?? message).trim();
    if (!text) return;

    setLoading(true);
    setError(null);

    try {
      const response = await askCoachTai({
        message: text,
        context: {
          profileName,
          workoutName,
          completedToday,
          weeklyWorkoutCount,
        },
      });

      setReply(response);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao falar com o Coach TAI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 z-40"
        aria-label="Abrir Coach TAI"
      >
        <span className="absolute inset-0 rounded-[28px] bg-[#1D4ED8]/25 blur-xl scale-110" />
        <span
          className="relative flex items-center gap-2 rounded-[26px] border border-white/40 px-3 py-2.5 text-white backdrop-blur-md overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.98), rgba(29,78,216,0.92) 55%, rgba(15,23,42,0.95))",
            boxShadow: "0 18px 30px rgba(29, 78, 216, 0.30), inset 0 1px 0 rgba(255,255,255,0.22)",
          }}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_42%)]" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/16 border border-white/20">
            <Sparkles size={16} />
          </span>
          <span className="relative text-left leading-none">
            <span className="block text-[11px] font-semibold text-white/75 uppercase tracking-[0.18em]">
              TAI
            </span>
            <span className="block text-xs font-black mt-1">Coach</span>
          </span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md"
            >
              <div className="rounded-3xl bg-white border border-[#DBEAFE] shadow-2xl overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} />
                    <div>
                      <p className="text-sm font-black">Coach TAI</p>
                      <p className="text-[11px] text-white/85">Seu assistente rápido de treino</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-white/15 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] p-3">
                    <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wide mb-1">
                      Contexto de hoje
                    </p>
                    <p className="text-sm text-[#0F172A]">
                      Treino: <span className="font-bold">{workoutName}</span>
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {completedToday ? "Treino de hoje já concluído." : "Treino de hoje ainda pendente."}
                    </p>
                  </div>

                  {!reply && (
                    <div className="rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white border border-[#DBEAFE] p-3">
                      <p className="text-sm font-black text-[#0F172A]">
                        {profileName ? `${profileName},` : "Hoje,"} vamos treinar melhor?
                      </p>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        Toque numa pergunta pronta ou escreva algo curto para eu te ajudar com motivação,
                        aquecimento ou adaptação do treino.
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
                      Perguntas rápidas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(reply?.quickReplies ?? DEFAULT_PROMPTS).map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleAsk(prompt)}
                          disabled={loading}
                          className="px-3 py-2 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold border border-[#DBEAFE] disabled:opacity-60"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ex: me motiva para o treino de hoje"
                      className="w-full min-h-[88px] resize-none rounded-2xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                    />
                    <button
                      onClick={() => handleAsk()}
                      disabled={loading || !message.trim()}
                      className="w-full rounded-2xl bg-[#1D4ED8] text-white font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
                      Perguntar ao Coach
                    </button>
                  </div>

                  {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {reply && (
                    <div className="rounded-2xl bg-[#F8FBFF] border border-[#DBEAFE] p-4">
                      <p className="text-sm font-black text-[#0F172A]">{reply.title}</p>
                      <p className="text-sm text-[#334155] mt-2 leading-relaxed">{reply.answer}</p>
                      <div className="mt-3 space-y-2">
                        {reply.tips.map((tip) => (
                          <div key={tip} className="text-xs text-[#1E3A8A] font-semibold">
                            - {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

