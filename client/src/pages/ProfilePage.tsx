import { ArrowLeft, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type UserProfile = {
  name: string;
  weight: number | "";
  goal: string;
};

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    weight: "",
    goal: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; weight?: number; goal?: string };
      setProfile({
        name: parsed.name ?? "",
        weight: typeof parsed.weight === "number" ? parsed.weight : "",
        goal: parsed.goal ?? "",
      });
    } catch {
      // ignore invalid data
    }
  }, []);

  function handleChange<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (typeof window === "undefined") return;
    const payload = {
      name: profile.name.trim(),
      weight: typeof profile.weight === "number" ? profile.weight : Number(profile.weight) || 0,
      goal: profile.goal.trim(),
    };
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    toast("Perfil salvo!", {
      description: "Suas informações serão usadas na tela inicial.",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6F0] to-[#E8D5E8] text-[#2D1B3D] pb-24">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-white/60 px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[#E85B9C] hover:text-[#D946A6] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#E85B9C]" />
            <div>
              <h1 className="font-black text-lg">Perfil</h1>
              <p className="text-xs text-[#7D5B8D]">Dados básicos para o app</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pt-8">
        <form
          className="bg-white/80 rounded-3xl p-6 border border-white/60 shadow-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label className="block text-xs font-bold text-[#7D5B8D] mb-1 uppercase tracking-widest">
              Nome
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border border-[#E5D4EA] bg-white px-3 py-2 text-sm outline-none focus:border-[#E85B9C]"
              placeholder="Como você quer ser chamada no app"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7D5B8D] mb-1 uppercase tracking-widest">
                Peso atual (kg)
              </label>
              <input
                type="number"
                min={0}
                value={profile.weight}
                onChange={(e) => handleChange("weight", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-[#E5D4EA] bg-white px-3 py-2 text-sm outline-none focus:border-[#E85B9C]"
                placeholder="64"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7D5B8D] mb-1 uppercase tracking-widest">
              Meta / foco
            </label>
            <textarea
              value={profile.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              className="w-full rounded-xl border border-[#E5D4EA] bg-white px-3 py-2 text-sm outline-none focus:border-[#E85B9C] min-h-[80px] resize-none"
              placeholder="Ex: Ganho de glúteo e pernas, definição de abdômen..."
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E85B9C] to-[#D946A6] text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Save size={16} />
            Salvar perfil
          </button>
        </form>
      </div>
    </div>
  );
}

