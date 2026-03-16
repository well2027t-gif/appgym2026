import { BarChart3, BriefcaseMedical, Dumbbell, Home, Trophy, User } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { colorTheme } = useTheme();

  const items: NavItem[] = [
    { label: "Home", href: "/", icon: <Home size={19} /> },
    { label: "Treinos", href: "/treino", icon: <Dumbbell size={19} /> },
    { label: "Conquistas", href: "/conquistas", icon: <Trophy size={19} /> },
    { label: "Profissional", href: "/profissionais", icon: <BriefcaseMedical size={19} /> },
    { label: "Progresso", href: "/progress", icon: <BarChart3 size={19} /> },
    { label: "Perfil", href: "/profile", icon: <User size={19} /> },
  ];

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  const activeColor = colorTheme === "pink" ? "#BE185D" : "#1D4ED8";
  const activeShadow = colorTheme === "pink"
    ? "0 4px 14px rgba(236,72,153,0.28)"
    : "0 4px 14px rgba(37,99,235,0.28)";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[420px] px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))]">
        <div className="relative overflow-hidden rounded-[22px] border border-[#DBEAFE] bg-white/96 backdrop-blur-xl py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
          <div
            className="flex items-stretch"
          >
            {items.map((it, index) => {
              const active = isActive(it.href);
              return (
                <div key={it.href} className="flex flex-1 items-stretch">
                  <button
                    onClick={() => setLocation(it.href)}
                    className="flex flex-1 flex-col items-center justify-center py-1.5 transition-all"
                    aria-label={it.label}
                  >
                    <span
                      className="transition-all"
                      style={{
                        color: active ? activeColor : "#94A3B8",
                        filter: active ? `drop-shadow(${activeShadow})` : "none",
                      }}
                    >
                      {it.icon}
                    </span>
                    <span
                      className="mt-0.5 text-[9px] font-black transition-all"
                      style={{ color: active ? activeColor : "#94A3B8" }}
                    >
                      {it.label}
                    </span>
                    <span
                      className="mt-0.5 h-[3px] rounded-full transition-all"
                      style={{
                        width: active ? "18px" : "0px",
                        background: active
                          ? colorTheme === "pink"
                            ? "linear-gradient(90deg, #EC4899, #BE185D)"
                            : "linear-gradient(90deg, #3B82F6, #1D4ED8)"
                          : "transparent",
                        boxShadow: active ? activeShadow : "none",
                      }}
                    />
                  </button>
                  {index < items.length - 1 && (
                    <div className="my-2 w-px bg-[#EFF6FF] self-stretch" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
