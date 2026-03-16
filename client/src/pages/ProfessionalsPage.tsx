import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle, Star, Stethoscope, UserRoundCog } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrCreateConversation,
  listProfessionals,
  type ProfessionalDoc,
  type ProfessionalType,
} from "@/lib/professionalServices";

export default function ProfessionalsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [tab, setTab] = useState<ProfessionalType>("personal");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProfessionalDoc[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listProfessionals(tab)
      .then(res => {
        if (mounted) setItems(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [tab]);

  async function handleChat(professional: ProfessionalDoc) {
    const guestId = getOrCreateGuestId();
    const userId = user?.uid ?? guestId;
    setBusyId(professional.id);
    try {
      const conversationId = await getOrCreateConversation({
        userId,
        professionalId: professional.id,
        type: professional.type,
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `conversation_meta_${conversationId}`,
          JSON.stringify({
            professionalName: professional.displayName,
            professionalType: professional.type,
            professionalAvatar: professional.avatarUrl ?? "",
          }),
        );
      }
      setLocation(`/conversa/${conversationId}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F5F9FF] to-[#E7F0FF] pb-28">
      <div className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#DBEAFE]">
        <div className="mx-auto max-w-[420px] px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => setLocation("/")}
            className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center text-[#1D4ED8]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-black">Profissionais</p>
            <h1 className="text-[18px] font-black text-[#0F172A]">Escolha seu acompanhamento</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[420px] px-4 pt-4">
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-sm">
          <p className="text-[11px] text-[#64748B] uppercase tracking-[0.16em] font-black">Atendimento Premium</p>
          <h2 className="text-[18px] font-black text-[#0F172A] mt-1">Converse direto com seu especialista</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Escolha um profissional e inicie o chat imediatamente.
          </p>
        </div>

        <div className="rounded-2xl p-1 bg-white border border-[#DBEAFE] grid grid-cols-2 gap-1">
          <button
            onClick={() => setTab("personal")}
            className={`h-10 rounded-xl text-sm font-black transition ${
              tab === "personal" ? "bg-[#2563EB] text-white" : "text-[#475569]"
            }`}
          >
            Personais
          </button>
          <button
            onClick={() => setTab("nutritionist")}
            className={`h-10 rounded-xl text-sm font-black transition ${
              tab === "nutritionist" ? "bg-[#2563EB] text-white" : "text-[#475569]"
            }`}
          >
            Nutricionistas
          </button>
        </div>

        {loading ? (
          <div className="mt-4 rounded-2xl bg-white border border-[#DBEAFE] p-4 text-sm text-[#64748B]">
            Carregando profissionais...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white border border-[#DBEAFE] p-4 text-sm text-[#64748B]">
            Nenhum profissional disponível.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChat(item)}
                className="w-full text-left rounded-2xl bg-white border border-[#DBEAFE] p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[#EFF6FF] text-[#1D4ED8] grid place-items-center">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.displayName} className="h-full w-full object-cover" />
                    ) : item.type === "personal" ? (
                      <UserRoundCog size={24} />
                    ) : (
                      <Stethoscope size={24} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <p className="text-[16px] font-black text-[#0F172A] truncate">{item.displayName}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFF7E6] text-[#B45309] shrink-0">
                          <Star size={10} />
                          4.9
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] shrink-0">
                        <CheckCircle2 size={11} />
                        Disponível agora
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{item.bio || "Sem descrição."}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {(item.specialties ?? []).map(spec => (
                        <span
                          key={spec}
                          className="px-2 py-1 rounded-full text-[10px] font-black bg-[#EFF6FF] text-[#1D4ED8]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 w-full h-11 rounded-xl bg-[#2563EB] text-white font-black text-sm flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  {busyId === item.id ? "Abrindo..." : "Conversar"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function getOrCreateGuestId() {
  if (typeof window === "undefined") return "guest-user";
  const key = "demo_guest_user_id";
  const stored = window.localStorage.getItem(key);
  if (stored) return stored;
  const created = `guest-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, created);
  return created;
}

