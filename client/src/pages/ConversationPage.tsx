import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Circle, SendHorizonal } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/hooks/useConversation";
import { getConversationById } from "@/lib/professionalServices";

export default function ConversationPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/conversa/:conversationId");
  const conversationId = match ? params.conversationId : "";
  const { user } = useAuth();
  const { groupedByDate, loading, sending, sendMessage } = useConversation(conversationId);
  const [text, setText] = useState("");
  const [headerName, setHeaderName] = useState("Dra. Carol");
  const [headerAvatar, setHeaderAvatar] = useState(
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  );
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [showProfessionalProfile, setShowProfessionalProfile] = useState(false);
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { height: 0, width: 0, offsetTop: 0, offsetLeft: 0 };
    const vv = window.visualViewport;
    return {
      height: vv?.height ?? window.innerHeight,
      width: vv?.width ?? window.innerWidth,
      offsetTop: vv?.offsetTop ?? 0,
      offsetLeft: vv?.offsetLeft ?? 0,
    };
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const senderId = user?.uid ?? getGuestId();

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () =>
      setViewport({
        height: vv.height,
        width: vv.width,
        offsetTop: vv.offsetTop,
        offsetLeft: vv.offsetLeft,
      });
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.documentElement.style.touchAction;
    document.body.style.overflow = "hidden";
    document.documentElement.style.touchAction = "pan-x pan-y";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.touchAction = prevTouchAction;
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    getConversationById(conversationId).then(item => {
      if (!item || !user) return;
      if (user) {
        const fallbackName = item.professionalId === user.uid ? "Aluno" : "Dra. Carol";
        setHeaderName(normalizeProfessionalName(fallbackName));
      }
    });
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(`conversation_meta_${conversationId}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { professionalName?: string; professionalAvatar?: string };
          if (parsed.professionalName) setHeaderName(normalizeProfessionalName(parsed.professionalName));
          if (parsed.professionalAvatar) setHeaderAvatar(parsed.professionalAvatar);
        } catch {
          // noop
        }
      }
    }
  }, [conversationId, user]);

  const prevCountRef = useRef(0);
  useEffect(() => {
    const total = groupedByDate.reduce((acc, g) => acc + g.items.length, 0);
    if (total !== prevCountRef.current || isAutoTyping) {
      prevCountRef.current = total;
      scrollToBottom();
    }
  }, [groupedByDate, isAutoTyping]);

  async function handleSend() {
    const message = text.trim();
    if (!message) return;
    setText("");
    await sendMessage({
      senderId,
      receiverId: "demo-professional",
      text: message,
    });
    scheduleAutoReply(message);
    scrollToBottom();
  }

  const autoStarter = useMemo(
    () => "Oi, tudo bem? Quero ajustar meu cronograma. Você pode avaliar meus planos?",
    [],
  );

  function scheduleAutoReply(message: string) {
    const reply = buildAutoReply(message);
    setIsAutoTyping(true);
    window.setTimeout(async () => {
      await sendMessage({
        senderId: "demo-professional",
        receiverId: senderId,
        text: reply,
      });
      setIsAutoTyping(false);
    }, 900);
  }

  async function handleAutoStarter(prompt: string) {
    await sendMessage({
      senderId,
      receiverId: "demo-professional",
      text: prompt,
    });
    scheduleAutoReply(prompt);
  }

  return (
    <div
      className="fixed overflow-hidden bg-linear-to-b from-[#F5F9FF] to-[#EAF2FF] flex flex-col z-30"
      style={{
        top: viewport.offsetTop,
        left: viewport.offsetLeft,
        width: viewport.width ? `${viewport.width}px` : "100%",
        height: viewport.height ? `${viewport.height}px` : "100dvh",
        maxHeight: "100dvh",
      }}
    >
      <div className="mx-auto max-w-[420px] flex-1 min-h-0 flex flex-col px-3 py-3 w-full">
      <div className="flex-1 min-h-0 rounded-3xl border border-[#DCE8FF] bg-white/92 overflow-hidden flex flex-col">
      <div className="px-3 py-3 border-b border-[#E6EEFF]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation("/profissionais")}
            className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center text-[#1D4ED8]"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex-1 px-2 py-1.5 flex items-center justify-between rounded-2xl border border-[#DCE8FF] bg-linear-to-r from-[#EEF5FF] to-[#F8FBFF]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-[#DBEAFE] grid place-items-center text-[#1D4ED8] font-black shrink-0">
                {headerAvatar ? (
                  <img src={headerAvatar} alt={headerName} className="h-full w-full object-cover" />
                ) : (
                  headerName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[14px] font-black text-[#0F172A] leading-tight wrap-break-word">{headerName}</p>
                <p className="text-[11px] text-[#16A34A] font-bold flex items-center gap-1">
                  <Circle size={8} fill="currentColor" />
                  Atendimento ativo
                </p>
                <p className="text-[11px] text-[#64748B] mt-1 leading-snug wrap-break-word">
                  Nutrição esportiva · responde em poucos minutos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProfessionalProfile(true)}
              className="px-2 py-1 rounded-full text-[10px] font-black text-[#1D4ED8] bg-white border border-[#DBEAFE] shrink-0 whitespace-nowrap"
            >
              Ver perfil
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 overscroll-contain">
        <div className="space-y-4 min-h-full">
        {loading ? (
          <div className="text-sm text-[#64748B]">Carregando mensagens...</div>
        ) : groupedByDate.length === 0 ? (
          <div className="p-4 text-sm text-[#64748B] min-h-[240px]">
            <div className="text-center max-w-[280px] mx-auto">
              <p className="font-black text-[#334155]">Inicie uma conversa</p>
              <p className="mt-1">Escolha um modelo para começar no modo automático.</p>
            </div>
            <button
              onClick={() => handleAutoStarter(autoStarter)}
              className="mt-4 w-full text-left rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-3 hover:bg-[#EEF5FF] transition"
            >
              <p className="text-[12px] font-bold text-[#0F172A] leading-snug">
                Oi, tudo bem? Quero ajustar meu cronograma. Você pode avaliar meus planos?
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">
                Quero iniciar meu acompanhamento com você.
              </p>
            </button>
          </div>
        ) : (
          groupedByDate.map(group => (
            <div key={group.date}>
              <div className="flex justify-center mb-2">
                <p className="text-[10px] text-[#64748B] font-black px-2.5 py-1 rounded-full bg-[#EEF5FF] border border-[#DBEAFE]">
                  {group.date}
                </p>
              </div>
              <div className="space-y-2">
                {group.items.map(item => {
                  const mine = item.senderId === senderId;
                  return (
                    <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                          mine
                            ? "bg-[#2563EB] text-white rounded-br-md"
                            : "bg-white border border-[#DBEAFE] text-[#0F172A] rounded-bl-md"
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {isAutoTyping && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl rounded-bl-md text-sm bg-white border border-[#DBEAFE] text-[#64748B]">
              digitando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2 shrink-0" aria-hidden />
        </div>
      </div>

      <div className="border-t border-[#E6EEFF] shrink-0 bg-white/95">
        <div
          className="px-3 pt-2"
          style={{
            paddingBottom: "calc(0.65rem + env(safe-area-inset-bottom) + 52px)",
          }}
        >
          <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={scrollToBottom}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-w-0 h-11 rounded-xl border border-[#DBEAFE] px-3 text-sm outline-none focus:border-[#2563EB]"
            style={{ fontSize: "16px" }}
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="h-11 w-11 rounded-xl bg-[#2563EB] text-white grid place-items-center disabled:opacity-60"
          >
            <SendHorizonal size={16} />
          </button>
          </div>
        </div>
      </div>

      {showProfessionalProfile && (
        <div className="fixed inset-0 z-40 bg-[#0F172A]/45 backdrop-blur-[1px] px-4 py-6 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md rounded-3xl overflow-hidden bg-white border border-[#DBEAFE] shadow-2xl">
            <div className="px-5 pt-5 pb-4 bg-linear-to-r from-[#EEF5FF] to-[#F8FBFF] border-b border-[#DBEAFE]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={headerAvatar}
                    alt={headerName}
                    className="h-18 w-18 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <div className="min-w-0">
                    <p className="text-[20px] font-black text-[#0F172A] truncate leading-tight">{headerName}</p>
                    <p className="text-xs text-[#16A34A] font-bold">Atendimento ativo</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      Nutrição esportiva · CRM válido
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfessionalProfile(false)}
                  className="h-8 w-8 rounded-lg border border-[#DBEAFE] text-[#64748B] text-sm font-black bg-white"
                >
                  x
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <MiniStat title="Clientes" value="320+" />
                <MiniStat title="Avaliação" value="4.9" />
                <MiniStat title="Resp." value="~5min" />
              </div>
            </div>

            <div className="p-5">
              <div className="mt-0 rounded-2xl border border-[#E5EEFF] bg-[#F8FBFF] overflow-hidden">
                <ProfileInfo title="Especialidade" value="Nutrição esportiva e recomposição corporal" />
                <ProfileInfo title="Experiência" value="8+ anos atendendo atletas e iniciantes" />
                <ProfileInfo title="Abordagem" value="Plano alimentar personalizado com ajustes semanais" />
                <ProfileInfo title="Objetivo do acompanhamento" value="Melhorar performance, composição corporal e rotina alimentar" />
              </div>
              <div className="mt-3">
                <p className="text-[11px] text-[#94A3B8]">
                  Dados sensíveis como WhatsApp e endereço não são exibidos aqui.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProfessionalProfile(false)}
                className="mt-4 h-11 w-full rounded-xl bg-[#2563EB] text-white font-black text-sm"
              >
                Voltar para conversa
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

function getGuestId() {
  if (typeof window === "undefined") return "guest-user";
  return window.localStorage.getItem("demo_guest_user_id") ?? "guest-user";
}

function normalizeProfessionalName(name: string) {
  if (!name) return "Dra. Carol";
  return name.replace(/Dra\.\s*Camila/gi, "Dra. Carol").trim();
}

function ProfileInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="px-3 py-2.5 border-b border-[#E5EEFF] last:border-b-0">
      <p className="text-[10px] uppercase tracking-wide text-[#64748B] font-black">{title}</p>
      <p className="text-[13px] text-[#0F172A] font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#DBEAFE] bg-white px-2 py-2 text-center">
      <p className="text-[10px] text-[#64748B] font-black">{title}</p>
      <p className="text-[13px] text-[#0F172A] font-black mt-0.5">{value}</p>
    </div>
  );
}

function buildAutoReply(message: string) {
  const m = message.toLowerCase();
  if (m.includes("massa") || m.includes("hipertrofia")) {
    return "Perfeito! Para ganho de massa eu monto um plano com progressão de carga e foco em recuperação. Quer 4 ou 5 dias por semana?";
  }
  if (m.includes("emag") || m.includes("secar")) {
    return "Ótimo objetivo. Vamos combinar treino de força + cardio e ajustar alimentação para déficit leve e sustentável.";
  }
  if (m.includes("iniciante") || m.includes("começando")) {
    return "Sem problema, começamos com uma base técnica e volume progressivo para você evoluir com segurança.";
  }
  return "Perfeito, entendi seu objetivo. Posso te enviar um plano inicial agora e ajustar com seu feedback.";
}

