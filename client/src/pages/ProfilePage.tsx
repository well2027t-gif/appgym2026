import { ArrowLeft, Camera, CheckCircle2, Dumbbell, Flame, ImagePlus, MapPin, Save, TicketPercent, Trash2, User, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { hasFirebaseConfig } from "@/lib/firebase";
import { uploadProgressPhoto, type ProgressView } from "@/lib/professionalServices";
import { useTheme } from "@/contexts/ThemeContext";

type UserProfile = {
  name: string;
  weight: number | "";
  height: number | "";
  age: number | "";
  bodyFat: number | "";
  goal: string;
  goalWeight: number | "";
  goalStartWeight: number | "";
  city: string;
  photoDataUrl: string;
  progressPhotos: string[];
};

const GOAL_OPTIONS = [
  { key: "ganhar-massa",  label: "Ganhar massa",   emoji: "💪", desc: "Hipertrofia" },
  { key: "perder-peso",   label: "Perder peso",    emoji: "🔥", desc: "Emagrecimento" },
  { key: "definicao",     label: "Definição",      emoji: "⚡", desc: "Corpo definido" },
  { key: "manutencao",    label: "Manutenção",     emoji: "⚖️", desc: "Manter forma" },
  { key: "saude-geral",   label: "Saúde geral",    emoji: "❤️", desc: "Bem-estar" },
  { key: "performance",   label: "Performance",    emoji: "🏆", desc: "Alto rendimento" },
];

function getBmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "#F59E0B" };
  if (bmi < 25)   return { label: "Peso normal ✓",  color: "#16A34A" };
  if (bmi < 30)   return { label: "Sobrepeso",       color: "#F97316" };
  if (bmi < 35)   return { label: "Obesidade G.I",   color: "#EF4444" };
  return              { label: "Obesidade G.II+",    color: "#DC2626" };
}

function getBodyFatInfo(bf: number, age: number): { label: string; color: string } {
  if (bf < 6)  return { label: "Essencial",  color: "#F59E0B" };
  if (bf < 14) return { label: "Atleta 🏆",   color: "#16A34A" };
  if (bf < 18) return { label: "Fitness ✓",  color: "#22C55E" };
  if (bf < 25) return { label: "Médio",       color: "#F97316" };
  return            { label: "Alto",          color: "#EF4444" };
}

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";
const MAX_PROGRESS_PHOTOS = 8;

const ALL_REWARDS: Record<string, { title: string }> = {
  "cupom-10":        { title: "Cupom 10% suplementos" },
  "sessao-nutri":    { title: "Sessão c/ nutricionista" },
  "sessao-personal": { title: "Sessão c/ personal" },
  "brinde-kit":      { title: "Brinde premium" },
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { colorTheme, setColorTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>({
    name: "", weight: "", height: "", age: "", bodyFat: "",
    goal: "", goalWeight: "", goalStartWeight: "",
    city: "", photoDataUrl: "", progressPhotos: [],
  });

  const primary     = colorTheme === "pink" ? "#DB2777" : "#2563EB";
  const primaryDark = colorTheme === "pink" ? "#9D174D" : "#1D4ED8";
  const primaryLight= colorTheme === "pink" ? "#FCE7F3" : "#DBEAFE";
  const primaryGrad = colorTheme === "pink"
    ? "linear-gradient(135deg,#EC4899,#DB2777)"
    : "linear-gradient(135deg,#3B82F6,#1D4ED8)";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<UserProfile & { weight: number; height: number; age: number }>;
      setProfile({
        name: parsed.name ?? "",
        weight: typeof parsed.weight === "number" ? parsed.weight : "",
        height: typeof parsed.height === "number" ? parsed.height : "",
        age: typeof parsed.age === "number" ? parsed.age : "",
        bodyFat: typeof (parsed as any).bodyFat === "number" ? (parsed as any).bodyFat : "",
        goal: parsed.goal ?? "",
        goalWeight: typeof (parsed as any).goalWeight === "number" ? (parsed as any).goalWeight : "",
        goalStartWeight: typeof (parsed as any).goalStartWeight === "number" ? (parsed as any).goalStartWeight : "",
        city: parsed.city ?? "",
        photoDataUrl: typeof parsed.photoDataUrl === "string" ? parsed.photoDataUrl : "",
        progressPhotos: Array.isArray(parsed.progressPhotos) ? parsed.progressPhotos.slice(0, MAX_PROGRESS_PHOTOS) : [],
      });
    } catch {}
  }, []);

  const redeemedRewards: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("gymtracker_redeemed_rewards_v1") ?? "[]"); }
    catch { return []; }
  })();

  function handleChange<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (typeof window === "undefined") return;
    const current = typeof profile.weight === "number" ? profile.weight : Number(profile.weight) || 0;
    const gw = typeof profile.goalWeight === "number" ? profile.goalWeight : Number(profile.goalWeight) || 0;
    let gsw = typeof profile.goalStartWeight === "number" ? profile.goalStartWeight : Number(profile.goalStartWeight) || 0;
    if ((profile.goal === "perder-peso" || profile.goal === "ganhar-massa") && gw && !gsw) {
      gsw = current;
    }
    const payload = {
      name: profile.name.trim(),
      weight: current,
      height: typeof profile.height === "number" ? profile.height : Number(profile.height) || 0,
      age: typeof profile.age === "number" ? profile.age : Number(profile.age) || 0,
      bodyFat: typeof profile.bodyFat === "number" ? profile.bodyFat : Number(profile.bodyFat) || 0,
      goal: profile.goal.trim(),
      goalWeight: gw,
      goalStartWeight: gsw,
      city: profile.city.trim(),
      photoDataUrl: profile.photoDataUrl || "",
      progressPhotos: profile.progressPhotos.slice(0, MAX_PROGRESS_PHOTOS),
    };
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    setProfile(prev => ({ ...prev, goalStartWeight: gsw || prev.goalStartWeight }));
    toast("Perfil salvo!", { description: "Suas informações foram atualizadas." });
  }

  async function handlePhotoSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Arquivo inválido"); return; }
    try {
      const dataUrl = await resizeImageToDataUrl(file, 280, 0.82);
      handleChange("photoDataUrl", dataUrl);
      toast("Foto atualizada", { description: "Salve o perfil para aplicar." });
    } catch { toast("Erro ao processar foto"); }
  }

  async function handleProgressPhotoSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Arquivo inválido"); return; }
    try {
      const dataUrl = await resizeImageToDataUrl(file, 900, 0.84);
      setProfile(prev => ({ ...prev, progressPhotos: [dataUrl, ...prev.progressPhotos].slice(0, MAX_PROGRESS_PHOTOS) }));
      if (hasFirebaseConfig && user) {
        const cycle: ProgressView[] = ["front", "side", "back"];
        await uploadProgressPhoto({ userId: user.uid, file, view: cycle[profile.progressPhotos.length % 3] });
      }
      toast("Foto adicionada");
    } catch { toast("Erro ao processar foto"); }
  }

  function removeProgressPhoto(index: number) {
    setProfile(prev => ({ ...prev, progressPhotos: prev.progressPhotos.filter((_, i) => i !== index) }));
  }

  function setProgressAsProfile(index: number) {
    const selected = profile.progressPhotos[index];
    if (!selected) return;
    setProfile(prev => ({ ...prev, photoDataUrl: selected }));
    toast("Foto de perfil atualizada");
  }

  const bmiVal = profile.weight && profile.height
    ? Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)
    : null;
  const bmi = bmiVal ? bmiVal.toFixed(1) : null;
  const bmiInfo = bmiVal ? getBmiInfo(bmiVal) : null;
  const bodyFatNum = profile.bodyFat !== "" ? Number(profile.bodyFat) : null;
  const bfInfo = bodyFatNum ? getBodyFatInfo(bodyFatNum, Number(profile.age) || 25) : null;
  const selectedGoal = GOAL_OPTIONS.find(g => g.key === profile.goal);

  const currentKg = profile.weight !== "" ? Number(profile.weight) : null;
  const goalKg = profile.goalWeight !== "" ? Number(profile.goalWeight) : null;
  const startKg = profile.goalStartWeight !== "" ? Number(profile.goalStartWeight) : currentKg;
  const weightGoalProgress = (() => {
    if (!currentKg || !goalKg || !startKg) return null;
    if (profile.goal === "perder-peso") {
      if (currentKg <= goalKg) return 100;
      if (startKg <= goalKg) return 0;
      const total = startKg - goalKg;
      const done = startKg - currentKg;
      return Math.round((done / total) * 100);
    }
    if (profile.goal === "ganhar-massa") {
      if (currentKg >= goalKg) return 100;
      if (startKg >= goalKg) return 0;
      const total = goalKg - startKg;
      const done = currentKg - startKg;
      return Math.round((done / total) * 100);
    }
    return null;
  })();
  const showWeightGoal = (profile.goal === "perder-peso" || profile.goal === "ganhar-massa") && (currentKg || goalKg);

  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(180deg,#F0F6FF,#E8F0FE)" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/60" style={{ background: "rgba(255,255,255,0.90)" }}>
        <div className="max-w-[420px] mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="h-9 w-9 rounded-xl border border-[#DBEAFE] grid place-items-center" style={{ color: primary }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Minha conta</p>
            <h1 className="text-[17px] font-black text-[#0F172A] leading-tight">Perfil</h1>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-black text-white shadow"
            style={{ background: primaryGrad }}
          >
            <Save size={13} /> Salvar
          </button>
        </div>
      </div>

      <div className="max-w-[420px] mx-auto px-4 pt-4 space-y-3">

        {/* Hero card */}
        <div className="rounded-3xl overflow-hidden shadow-[0_12px_28px_rgba(37,99,235,0.15)]">
          <div className="relative px-5 pt-5 pb-14 text-white"
            style={{
              backgroundImage: `linear-gradient(160deg,rgba(8,14,42,0.90),rgba(8,14,42,0.72)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80)`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}>
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-25 -translate-y-10 translate-x-10"
              style={{ background: primary }} />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                  {profile.photoDataUrl
                    ? <img src={profile.photoDataUrl} alt="Perfil" className="h-full w-full object-cover" />
                    : <div className="h-full w-full bg-white/15 flex items-center justify-center"><User size={28} className="text-white/60" /></div>
                  }
                </div>
                <label className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md" style={{ background: primary }}>
                  <Camera size={12} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoSelect(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">Atleta</p>
                <p className="text-[20px] font-black text-white leading-tight truncate">{profile.name || "Welington"}</p>
                {profile.city && (
                  <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {profile.city}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-black text-white">
                    ⭐ Premium
                  </span>
                  {selectedGoal && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-black text-white">
                      {selectedGoal.emoji} {selectedGoal.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="bg-white grid grid-cols-4 divide-x divide-[#EFF6FF] -mt-8 relative z-10 rounded-2xl mx-3 shadow-md border border-[#DBEAFE]">
            {[
              { label: "Peso", value: profile.weight ? `${profile.weight}kg` : "—", sub: null, icon: <Weight size={12}/> },
              { label: "Altura", value: profile.height ? `${profile.height}cm` : "—", sub: null, icon: <Dumbbell size={12}/> },
              { label: "IMC", value: bmi ?? "—", sub: bmiInfo?.label ?? null, color: bmiInfo?.color, icon: <CheckCircle2 size={12}/> },
              { label: "Gordura", value: bodyFatNum ? `${bodyFatNum}%` : "—", sub: bfInfo?.label ?? null, color: bfInfo?.color, icon: <Flame size={12}/> },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-2.5 gap-0.5 px-1">
                <span style={{ color: primary }}>{s.icon}</span>
                <p className="text-[13px] font-black text-[#0F172A] leading-none">{s.value}</p>
                {s.sub
                  ? <p className="text-[8px] font-bold leading-tight text-center" style={{ color: s.color ?? "#94A3B8" }}>{s.sub}</p>
                  : <p className="text-[8px] text-[#94A3B8] uppercase tracking-wide">{s.label}</p>
                }
              </div>
            ))}
          </div>
          {showWeightGoal && weightGoalProgress !== null && (
            <div className="bg-white px-3 pt-2 pb-3 -mt-1 rounded-b-2xl mx-3 border border-t-0 border-[#DBEAFE]">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-black text-[#0F172A]">
                  {profile.goal === "perder-peso" ? "Perder peso" : "Ganhar massa"}: {currentKg} → {goalKg} kg
                </span>
                <span className="font-black" style={{ color: primary }}>{Math.min(100, Math.max(0, weightGoalProgress))}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#EFF6FF] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, weightGoalProgress))}%`, background: primaryGrad }} />
              </div>
            </div>
          )}
          <div className="bg-white h-3 rounded-b-3xl" />
        </div>

        {/* Theme selector */}
        <div className="rounded-2xl border border-[#DBEAFE] bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-wide mb-2">Cor do tema</p>
          <div className="flex items-center gap-3">
            {([
              { key: "blue", bg: "#2563EB", label: "Azul" },
              { key: "pink", bg: "#EC4899", label: "Rosa" },
            ] as const).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setColorTheme(t.key)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 border transition-all"
                style={{
                  borderColor: colorTheme === t.key ? t.bg : "#DBEAFE",
                  background: colorTheme === t.key ? t.bg + "18" : "white",
                }}
              >
                <span style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: t.bg,
                  boxShadow: colorTheme === t.key ? `0 0 0 3px white, 0 0 0 5px ${t.bg}` : "none",
                  flexShrink: 0,
                }} />
                <span className="text-[12px] font-black" style={{ color: colorTheme === t.key ? t.bg : "#64748B" }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
          className="rounded-2xl border border-[#DBEAFE] bg-white px-4 py-4 shadow-sm space-y-3"
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <p className="text-[12px] font-black text-[#0F172A] uppercase tracking-wide">Dados pessoais</p>

          <Field label="Nome">
            <input type="text" value={profile.name} onChange={e => handleChange("name", e.target.value)}
              className="field-input" placeholder="Seu nome" style={{ borderColor: "#DBEAFE" }} />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Peso (kg)">
              <input type="number" min={0} value={profile.weight}
                onChange={e => handleChange("weight", e.target.value === "" ? "" : Number(e.target.value))}
                className="field-input" placeholder="94" />
            </Field>
            <Field label="Altura (cm)">
              <input type="number" min={0} value={profile.height}
                onChange={e => handleChange("height", e.target.value === "" ? "" : Number(e.target.value))}
                className="field-input" placeholder="178" />
            </Field>
            <Field label="Idade">
              <input type="number" min={0} value={profile.age}
                onChange={e => handleChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                className="field-input" placeholder="30" />
            </Field>
            <Field label="% Gordura corporal">
              <input type="number" min={0} max={60} step={0.1} value={profile.bodyFat}
                onChange={e => handleChange("bodyFat", e.target.value === "" ? "" : Number(e.target.value))}
                className="field-input" placeholder="13" />
            </Field>
          </div>

          <Field label="Cidade">
            <input type="text" value={profile.city} onChange={e => handleChange("city", e.target.value)}
              className="field-input" placeholder="São Paulo" />
          </Field>

          {/* Goal selector */}
          <div>
            <label className="block text-[10px] font-black text-[#64748B] mb-2 uppercase tracking-widest">Objetivo</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_OPTIONS.map(g => {
                const active = profile.goal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => handleChange("goal", g.key)}
                    className="rounded-xl border px-2 py-2.5 flex flex-col items-center gap-1 transition-all"
                    style={{
                      borderColor: active ? primary : "#DBEAFE",
                      background: active ? primaryLight : "white",
                    }}
                  >
                    <span className="text-[18px] leading-none">{g.emoji}</span>
                    <p className="text-[10px] font-black leading-tight text-center" style={{ color: active ? primary : "#0F172A" }}>{g.label}</p>
                    <p className="text-[8px] text-[#94A3B8] leading-none">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta de peso (perder / ganhar) */}
          {(profile.goal === "perder-peso" || profile.goal === "ganhar-massa") && (
            <div className="rounded-xl border px-4 py-3 space-y-3" style={{ borderColor: primary + "40", background: primaryLight + "50" }}>
              <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: primary }}>
                {profile.goal === "perder-peso" ? "Meta: perder peso" : "Meta: ganhar massa"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#64748B] mb-1">Peso atual (kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={profile.weight}
                    onChange={e => handleChange("weight", e.target.value === "" ? "" : Number(e.target.value))}
                    className="field-input"
                    placeholder="94"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#64748B] mb-1">
                    {profile.goal === "perder-peso" ? "Quero chegar em (kg)" : "Quero chegar em (kg)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={profile.goalWeight}
                    onChange={e => handleChange("goalWeight", e.target.value === "" ? "" : Number(e.target.value))}
                    className="field-input"
                    placeholder={profile.goal === "perder-peso" ? "85" : "98"}
                  />
                </div>
              </div>
              {showWeightGoal && weightGoalProgress !== null && (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black mb-1.5">
                    <span className="text-[#0F172A]">
                      {currentKg} kg → {goalKg} kg
                    </span>
                    <span style={{ color: primary }}>{Math.min(100, Math.max(0, weightGoalProgress))}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, weightGoalProgress))}%`,
                        background: primaryGrad,
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-[#64748B] mt-1">
                    {profile.goal === "perder-peso"
                      ? weightGoalProgress >= 100
                        ? "Meta de peso atingida!"
                        : `Faltam ${Math.max(0, (currentKg ?? 0) - (goalKg ?? 0))} kg para a meta`
                      : weightGoalProgress >= 100
                        ? "Meta de peso atingida!"
                        : `Faltam ${Math.max(0, (goalKg ?? 0) - (currentKg ?? 0))} kg para a meta`}
                  </p>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="w-full py-3 rounded-xl font-black text-[14px] text-white shadow-md"
            style={{ background: primaryGrad }}>
            <Save size={14} className="inline mr-1.5 -mt-0.5" /> Salvar perfil
          </button>
        </form>

        {/* Redeemed coupons */}
        {redeemedRewards.length > 0 && (
          <div className="rounded-2xl border border-[#DBEAFE] bg-white px-4 py-4 shadow-sm">
            <p className="text-[12px] font-black text-[#0F172A] uppercase tracking-wide mb-3">Meus cupons</p>
            <div className="space-y-2">
              {redeemedRewards.map(id => {
                const r = ALL_REWARDS[id];
                if (!r) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                    style={{ borderColor: primary + "33", background: primaryLight }}>
                    <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0" style={{ color: primary }}>
                      <TicketPercent size={15} />
                    </span>
                    <p className="flex-1 text-[12px] font-black text-[#0F172A]">{r.title}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-black" style={{ color: primary, border: `1px solid ${primary}33` }}>
                      <CheckCircle2 size={10} /> Ativo
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress photos */}
        <div className="rounded-2xl border border-[#DBEAFE] bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-black text-[#0F172A] uppercase tracking-wide">Fotos de progresso</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Acompanhe sua evolução visual</p>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black shrink-0"
              style={{ borderColor: primary + "50", color: primary, background: primaryLight }}>
              <ImagePlus size={13} /> Adicionar
              <input type="file" accept="image/*" className="hidden" onChange={e => handleProgressPhotoSelect(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {profile.progressPhotos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DBEAFE] bg-[#F8FBFF] py-8 text-center text-[12px] text-[#94A3B8]">
              Nenhuma foto ainda. Adicione sua primeira foto de progresso.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {profile.progressPhotos.map((photo, idx) => (
                <div key={`${photo.slice(0, 20)}-${idx}`} className="relative group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#DBEAFE]">
                    <img src={photo} alt={`Progresso ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setProgressAsProfile(idx)}
                      className="flex-1 rounded-lg bg-white/95 text-[9px] font-bold px-1 py-1 border border-[#DBEAFE] text-[#1D4ED8]">
                      Perfil
                    </button>
                    <button type="button" onClick={() => removeProgressPhoto(idx)}
                      className="rounded-lg bg-white/95 text-[#C2416C] px-1.5 py-1 border border-[#F2D4DE]">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .field-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #DBEAFE;
          background: #F8FBFF;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
          color: #0F172A;
        }
        .field-input:focus { border-color: #2563EB; background: white; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-[#64748B] mb-1 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function resizeImageToDataUrl(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
