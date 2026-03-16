import { useEffect, useState } from "react";
import { ArrowLeft, Camera, MessageCircle, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { listLinksByProfessional, type ClientProfessionalLinkDoc } from "@/lib/professionalServices";

export default function PersonalDashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfessionalLinkDoc[]>([]);

  useEffect(() => {
    if (!user) return;
    listLinksByProfessional(user.uid).then(setClients);
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8FBFF] pb-10">
      <div className="sticky top-0 z-20 bg-white border-b border-[#DBEAFE]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => setLocation("/")} className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center text-[#1D4ED8]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-black">Painel</p>
            <h1 className="text-[18px] font-black text-[#0F172A]">Personal Trainer</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat title="Clientes" value={String(clients.length)} icon={<Users size={16} />} />
          <Stat title="Mensagens" value="0" icon={<MessageCircle size={16} />} />
          <Stat title="Evolução" value="0" icon={<Camera size={16} />} />
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-[#DBEAFE]">
          <div className="px-4 py-3 border-b border-[#EEF2FF] text-sm font-black text-[#0F172A]">Clientes</div>
          <div className="p-3 space-y-2">
            {clients.length === 0 ? (
              <p className="text-sm text-[#64748B]">Nenhum cliente vinculado ainda.</p>
            ) : (
              clients.map(item => (
                <div key={item.id} className="rounded-xl border border-[#DBEAFE] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-[#0F172A]">{item.userId}</p>
                    <p className="text-xs text-[#64748B]">Status: {item.status}</p>
                  </div>
                  <button
                    onClick={() => setLocation(`/painel/personal/clientes/${item.userId}`)}
                    className="h-9 px-3 rounded-lg bg-[#2563EB] text-white text-xs font-black"
                  >
                    Ver cliente
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-[#DBEAFE] p-3">
      <div className="flex items-center justify-between text-[#1D4ED8]">{icon}</div>
      <p className="text-[12px] text-[#64748B] mt-1">{title}</p>
      <p className="text-[24px] font-black text-[#0F172A] leading-none mt-1">{value}</p>
    </div>
  );
}

