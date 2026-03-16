import { ArrowLeft, Camera, ImagePlus, Save, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type UserProfile = {
  name: string;
  weight: number | "";
  height: number | "";
  age: number | "";
  goal: string;
  city: string;
  photoDataUrl: string;
  progressPhotos: string[];
};

const PROFILE_STORAGE_KEY = "gymtracker_profile_v1";
const MAX_PROGRESS_PHOTOS = 8;

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { colorTheme, setColorTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    weight: "",
    height: "",
    age: "",
    goal: "",
    city: "",
    photoDataUrl: "",
    progressPhotos: [],
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        name?: string;
        weight?: number;
        height?: number;
        age?: number;
        goal?: string;
        city?: string;
        photoDataUrl?: string;
        progressPhotos?: string[];
      };
      setProfile({
        name: parsed.name ?? "",
        weight: typeof parsed.weight === "number" ? parsed.weight : "",
        height: typeof parsed.height === "number" ? parsed.height : "",
        age: typeof parsed.age === "number" ? parsed.age : "",
        goal: parsed.goal ?? "",
        city: parsed.city ?? "",
        photoDataUrl: typeof parsed.photoDataUrl === "string" ? parsed.photoDataUrl : "",
        progressPhotos: Array.isArray(parsed.progressPhotos) ? parsed.progressPhotos.slice(0, MAX_PROGRESS_PHOTOS) : [],
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
      height: typeof profile.height === "number" ? profile.height : Number(profile.height) || 0,
      age: typeof profile.age === "number" ? profile.age : Number(profile.age) || 0,
      goal: profile.goal.trim(),
      city: profile.city.trim(),
      photoDataUrl: profile.photoDataUrl || "",
      progressPhotos: profile.progressPhotos.slice(0, MAX_PROGRESS_PHOTOS),
    };
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    toast("Perfil salvo!", {
      description: "Suas informações serão usadas na tela inicial.",
    });
  }

  async function handlePhotoSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Arquivo inválido", { description: "Selecione uma imagem para foto de perfil." });
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file, 280, 0.82);
      handleChange("photoDataUrl", dataUrl);
      toast("Foto atualizada", { description: "Agora salve o perfil para aplicar na tela inicial." });
    } catch {
      toast("Erro ao processar foto", { description: "Tente novamente com outra imagem." });
    }
  }

  async function handleProgressPhotoSelect(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Arquivo inválido", { description: "Selecione uma imagem para foto de progresso." });
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file, 900, 0.84);
      setProfile((prev) => ({
        ...prev,
        progressPhotos: [dataUrl, ...prev.progressPhotos].slice(0, MAX_PROGRESS_PHOTOS),
      }));
      toast("Foto adicionada", { description: "Sua foto de progresso foi atualizada." });
    } catch {
      toast("Erro ao processar foto", { description: "Tente novamente com outra imagem." });
    }
  }

  function removeProgressPhoto(index: number) {
    setProfile((prev) => ({
      ...prev,
      progressPhotos: prev.progressPhotos.filter((_, i) => i !== index),
    }));
  }

  function setProgressAsProfile(index: number) {
    const selected = profile.progressPhotos[index];
    if (!selected) return;
    setProfile((prev) => ({ ...prev, photoDataUrl: selected }));
    toast("Foto de perfil atualizada", { description: "A foto escolhida agora aparece na tela inicial." });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF] text-[#0F172A] pb-24">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-white/60 px-4 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[#1D4ED8] hover:text-[#1E40AF] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#1D4ED8]" />
            <div>
              <h1 className="font-black text-lg">Perfil</h1>
              <p className="text-xs text-[#64748B]">Dados básicos para o app</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pt-6 space-y-4">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] overflow-hidden flex items-center justify-center shadow-sm">
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <User size={24} className="text-[#93A8C7]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-bold">Seu Perfil</p>
              <p className="text-lg font-black truncate">{profile.name || "Welington"}</p>
              <p className="text-[11px] text-[#64748B] truncate">
                {profile.goal || "Defina seu objetivo para evoluir."}
              </p>
            </div>
          </div>
        </div>

        <form
          className="bg-white/80 rounded-3xl p-6 border border-white/60 shadow-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-2 uppercase tracking-widest">
              Foto de perfil
            </label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] overflow-hidden flex items-center justify-center">
                {profile.photoDataUrl ? (
                  <img src={profile.photoDataUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <User size={24} className="text-[#93A8C7]" />
                )}
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-xs font-bold text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors">
                  <Camera size={14} />
                  Escolher foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(e.target.files?.[0] ?? null)}
                  />
                </label>
                {profile.photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange("photoDataUrl", "")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#F2D4DE] bg-white px-3 py-2 text-xs font-bold text-[#C2416C] hover:bg-[#FFF1F6] transition-colors"
                  >
                    <Trash2 size={14} />
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">Mudar cor do app</span>{" "}
              · toque em uma cor para trocar o tema.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setColorTheme("blue")}
                className={`h-6 w-6 rounded-full border transition-all ${
                  colorTheme === "blue"
                    ? "border-[#1D4ED8] bg-[#2563EB]"
                    : "border-[#CBD5F5] bg-[#E5EDFF]"
                }`}
                aria-label="Tema azul"
              />
              <button
                type="button"
                onClick={() => setColorTheme("pink")}
                className={`h-6 w-6 rounded-full border transition-all ${
                  colorTheme === "pink"
                    ? "border-[#DB2777] bg-[#EC4899]"
                    : "border-[#F9A8D4] bg-[#FFE4F1]"
                }`}
                aria-label="Tema rosa"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
              Nome
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              placeholder="Como você quer ser chamada no app"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
                Peso atual (kg)
              </label>
              <input
                type="number"
                min={0}
                value={profile.weight}
                onChange={(e) => handleChange("weight", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                placeholder="94"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
                Altura (cm)
              </label>
              <input
                type="number"
                min={0}
                value={profile.height}
                onChange={(e) => handleChange("height", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                placeholder="176"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
                Idade
              </label>
              <input
                type="number"
                min={0}
                value={profile.age}
                onChange={(e) => handleChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
              Cidade
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              placeholder="Sua cidade"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-widest">
              Meta / foco
            </label>
            <textarea
              value={profile.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              className="w-full rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563EB] min-h-[80px] resize-none"
              placeholder="Ex: Ganho de glúteo e pernas, definição de abdômen..."
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Save size={16} />
            Salvar perfil
          </button>
        </form>

        <section className="bg-white/80 rounded-3xl p-6 border border-white/60 shadow-lg space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Fotos de progresso</p>
              <p className="text-xs text-[#93A8C7] mt-1">Adicione novas fotos para acompanhar evolução.</p>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-[#DBEAFE] bg-white px-3 py-2 text-xs font-bold text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors shrink-0">
              <ImagePlus size={14} />
              Adicionar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleProgressPhotoSelect(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {profile.progressPhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DBEAFE] bg-[#F4F9FF] px-4 py-6 text-center text-sm text-[#93A8C7]">
              Nenhuma foto de progresso ainda. Adicione sua primeira foto.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {profile.progressPhotos.map((photo, idx) => (
                <div key={`${photo.slice(0, 30)}-${idx}`} className="relative group">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#DBEAFE] bg-white">
                    <img src={photo} alt={`Foto de progresso ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setProgressAsProfile(idx)}
                      className="flex-1 rounded-lg bg-white/90 text-[#1E3A8A] text-[10px] font-bold px-2 py-1 border border-[#DBEAFE]"
                    >
                      Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProgressPhoto(idx)}
                      className="rounded-lg bg-white/90 text-[#C2416C] px-2 py-1 border border-[#F2D4DE]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
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
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

