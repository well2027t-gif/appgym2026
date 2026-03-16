import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  listMealPlans,
  listProgressPhotosByUser,
  saveMealPlan,
  type MealPlanDoc,
  type ProgressPhotoDoc,
} from "@/lib/professionalServices";

export default function NutritionistClientDetailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/painel/nutricionista/clientes/:userId");
  const userId = match ? params.userId : "";
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhotoDoc[]>([]);
  const [plans, setPlans] = useState<MealPlanDoc[]>([]);
  const [title, setTitle] = useState("");
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    if (!user || !userId) return;
    listProgressPhotosByUser(userId).then(setPhotos);
    listMealPlans(userId, user.uid).then(setPlans);
  }, [userId, user]);

  async function handleCreatePlan() {
    if (!user || !userId || !title.trim()) return;
    await saveMealPlan({
      userId,
      professionalId: user.uid,
      title: title.trim(),
      caloriesTarget: calories > 0 ? calories : undefined,
      description: "",
      macros: { protein: 0, carbs: 0, fats: 0 },
      meals: [],
      active: true,
    });
    setTitle("");
    setCalories(0);
    const refreshed = await listMealPlans(userId, user.uid);
    setPlans(refreshed);
  }

  const grouped = {
    front: photos.filter(item => item.view === "front"),
    back: photos.filter(item => item.view === "back"),
    side: photos.filter(item => item.view === "side"),
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] pb-8">
      <div className="sticky top-0 z-20 bg-white border-b border-[#DBEAFE]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => setLocation("/painel/nutricionista")} className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center text-[#1D4ED8]">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-black">Cliente</p>
            <h1 className="text-[18px] font-black text-[#0F172A]">{userId}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <section className="rounded-2xl bg-white border border-[#DBEAFE] p-4">
          <h2 className="text-sm font-black text-[#0F172A] mb-3">Evolução (frente, costas, lado)</h2>
          <div className="grid grid-cols-3 gap-3">
            {(["front", "back", "side"] as const).map(key => (
              <div key={key} className="rounded-xl border border-[#DBEAFE] p-2">
                <p className="text-[11px] text-[#64748B] font-black uppercase mb-1">{key}</p>
                {grouped[key][0]?.url ? (
                  <img src={grouped[key][0].url} alt={key} className="w-full aspect-[3/4] object-cover rounded-lg" />
                ) : (
                  <div className="w-full aspect-[3/4] rounded-lg bg-[#F1F5F9]" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white border border-[#DBEAFE] p-4">
          <h2 className="text-sm font-black text-[#0F172A] mb-3">Plano alimentar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_110px] gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nome do plano"
              className="h-10 rounded-xl border border-[#DBEAFE] px-3 text-sm outline-none focus:border-[#2563EB]"
            />
            <input
              type="number"
              value={calories || ""}
              onChange={e => setCalories(Number(e.target.value || 0))}
              placeholder="Calorias"
              className="h-10 rounded-xl border border-[#DBEAFE] px-3 text-sm outline-none focus:border-[#2563EB]"
            />
            <button onClick={handleCreatePlan} className="h-10 rounded-xl bg-[#2563EB] text-white text-xs font-black flex items-center justify-center gap-1">
              <Save size={14} />
              Salvar
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {plans.length === 0 ? (
              <p className="text-sm text-[#64748B]">Nenhum plano alimentar cadastrado.</p>
            ) : (
              plans.map(item => (
                <div key={item.id} className="rounded-xl border border-[#DBEAFE] p-3">
                  <p className="text-sm font-black text-[#0F172A]">{item.title}</p>
                  <p className="text-xs text-[#64748B]">Meta calórica: {item.caloriesTarget ?? 0} kcal</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

