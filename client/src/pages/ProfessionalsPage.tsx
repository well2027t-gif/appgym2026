import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Gift, MessageCircle, Star, Stethoscope, TicketPercent, UserRoundCog, X } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrCreateConversation,
  listProfessionals,
  type ProfessionalDoc,
  type ProfessionalType,
} from "@/lib/professionalServices";

const ALL_REWARDS: Record<string, { title: string; desc: string }> = {
  "cupom-10":       { title: "Cupom 10% em suplementos", desc: "Desconto em parceiros oficiais" },
  "sessao-nutri":   { title: "Sessão gratuita c/ nutricionista", desc: "Consulta online de orientação inicial" },
  "sessao-personal":{ title: "Sessão gratuita c/ personal", desc: "Ajuste técnico e evolução de treino" },
  "brinde-kit":     { title: "Brinde premium do app", desc: "Camiseta ou squeeze exclusivo" },
};

const COUPON_USED_KEY = "gymtracker_coupon_used_v1";

export default function ProfessionalsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [tab, setTab] = useState<ProfessionalType>("personal");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProfessionalDoc[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [couponModal, setCouponModal] = useState<{ id: string; title: string } | null>(null);
  const [couponStep, setCouponStep] = useState<"type" | "professional">("type");
  const [couponType, setCouponType] = useState<ProfessionalType | null>(null);
  const [couponProfessionals, setCouponProfessionals] = useState<ProfessionalDoc[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const usedCoupons: Record<string, string> = (() => {
    try { return JSON.parse(localStorage.getItem(COUPON_USED_KEY) ?? "{}"); }
    catch { return {}; }
  })();

  const redeemedIds: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("gymtracker_redeemed_rewards_v1") ?? "[]"); }
    catch { return []; }
  })();
  const redeemedRewards = redeemedIds.map(id => ({ id, ...ALL_REWARDS[id] })).filter(r => r.title);

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

  function openUseCoupon(id: string, title: string) {
    setCouponModal({ id, title });
    setCouponStep("type");
    setCouponType(null);
    setCouponProfessionals([]);
  }

  function closeCouponModal() {
    setCouponModal(null);
    setCouponStep("type");
    setCouponType(null);
    setCouponProfessionals([]);
  }

  async function handleChooseCouponType(choice: ProfessionalType) {
    setCouponType(choice);
    setCouponLoading(true);
    try {
      const list = await listProfessionals(choice);
      setCouponProfessionals(list);
      setCouponStep("professional");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleConfirmCouponWith(professional: ProfessionalDoc) {
    if (!couponModal) return;
    const prev: Record<string, string> = JSON.parse(localStorage.getItem(COUPON_USED_KEY) ?? "{}");
    prev[couponModal.title] = professional.displayName;
    localStorage.setItem(COUPON_USED_KEY, JSON.stringify(prev));
    closeCouponModal();
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

        {/* Redeemed coupons banner */}
        {redeemedRewards.length > 0 && (
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Gift size={15} className="text-[#2563EB]" />
              <p className="text-[11px] font-black text-[#1D4ED8] uppercase tracking-wide">Seus cupons disponíveis</p>
            </div>
            {redeemedRewards.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-[#DBEAFE] bg-white px-3 py-2.5">
                <span className="h-8 w-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
                  <TicketPercent size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-[#0F172A] truncate">{r.title}</p>
                  <p className="text-[10px] text-[#64748B]">{r.desc}</p>
                </div>
                {usedCoupons[r.title] ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-1 text-[10px] font-black text-[#15803D] shrink-0">
                    <CheckCircle2 size={11} /> Com {usedCoupons[r.title]}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUseCoupon(r.id, r.title)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)" }}
                  >
                    Usar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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

      {/* Modal: Usar cupom → tipo → profissional */}
      {couponModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm px-4 pb-8 pt-4">
          <div className="w-full max-w-[420px] rounded-3xl bg-white border border-[#DBEAFE] shadow-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-[#EFF6FF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center">
                  <TicketPercent size={18} />
                </span>
                <div>
                  <p className="text-[12px] font-black text-[#1D4ED8] uppercase tracking-wide">Usar cupom</p>
                  <p className="text-[14px] font-black text-[#0F172A] truncate">{couponModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCouponModal}
                className="h-8 w-8 rounded-lg border border-[#DBEAFE] text-[#64748B] flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              {couponStep === "type" && (
                <>
                  <p className="text-[13px] font-black text-[#0F172A] mb-3">Usar com qual tipo de profissional?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleChooseCouponType("personal")}
                      disabled={couponLoading}
                      className="rounded-xl border-2 border-[#DBEAFE] bg-[#F8FBFF] p-4 flex flex-col items-center gap-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition disabled:opacity-60"
                    >
                      <UserRoundCog size={28} className="text-[#2563EB]" />
                      <span className="text-[13px] font-black text-[#0F172A]">Personal trainer</span>
                      <span className="text-[10px] text-[#64748B]">Treino e evolução</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChooseCouponType("nutritionist")}
                      disabled={couponLoading}
                      className="rounded-xl border-2 border-[#DBEAFE] bg-[#F8FBFF] p-4 flex flex-col items-center gap-2 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition disabled:opacity-60"
                    >
                      <Stethoscope size={28} className="text-[#2563EB]" />
                      <span className="text-[13px] font-black text-[#0F172A]">Nutricionista</span>
                      <span className="text-[10px] text-[#64748B]">Alimentação e metas</span>
                    </button>
                  </div>
                  {couponLoading && (
                    <p className="text-center text-[12px] text-[#64748B] mt-3">Carregando profissionais...</p>
                  )}
                </>
              )}

              {couponStep === "professional" && (
                <>
                  <p className="text-[13px] font-black text-[#0F172A] mb-3">
                    Escolha o profissional para usar o cupom
                  </p>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {couponProfessionals.length === 0 ? (
                      <p className="text-[12px] text-[#64748B] py-4 text-center">Nenhum profissional nesta categoria.</p>
                    ) : (
                      couponProfessionals.map(pro => (
                        <button
                          key={pro.id}
                          type="button"
                          onClick={() => handleConfirmCouponWith(pro)}
                          className="w-full flex items-center gap-3 rounded-xl border border-[#DBEAFE] bg-[#F8FBFF] p-3 text-left hover:bg-[#EFF6FF] transition"
                        >
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-[#DBEAFE] shrink-0">
                            {pro.avatarUrl ? (
                              <img src={pro.avatarUrl} alt={pro.displayName} className="h-full w-full object-cover" />
                            ) : pro.type === "personal" ? (
                              <div className="h-full w-full flex items-center justify-center text-[#2563EB]">
                                <UserRoundCog size={22} />
                              </div>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[#2563EB]">
                                <Stethoscope size={22} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-black text-[#0F172A] truncate">{pro.displayName}</p>
                            <p className="text-[11px] text-[#64748B] truncate">{pro.bio || "Profissional"}</p>
                          </div>
                          <span className="text-[11px] font-black text-[#2563EB] shrink-0">Usar cupom</span>
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCouponStep("type")}
                    className="mt-3 w-full py-2 rounded-xl border border-[#DBEAFE] text-[12px] font-bold text-[#64748B]"
                  >
                    ← Voltar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

