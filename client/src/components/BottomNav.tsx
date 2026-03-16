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
    { label: "Home", href: "/", icon: <Home size={20} /> },
    { label: "Treinos", href: "/treino", icon: <Dumbbell size={20} /> },
    { label: "Conquistas", href: "/conquistas", icon: <Trophy size={20} /> },
    { label: "Profissional", href: "/profissionais", icon: <BriefcaseMedical size={20} /> },
    { label: "Progresso", href: "/progress", icon: <BarChart3 size={20} /> },
    { label: "Perfil", href: "/profile", icon: <User size={20} /> },
  ];

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[420px] px-4 pb-[calc(0.35rem+env(safe-area-inset-bottom))]">
        <div className="relative overflow-hidden rounded-[24px] border border-[#DBEAFE] bg-white/95 backdrop-blur-xl px-2 py-1 shadow-[0_10px_28px_rgba(15,23,42,0.14)]">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-[2px] rounded-full bg-white" />
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map(it => {
              const active = isActive(it.href);
              return (
                <button
                  key={it.href}
                  onClick={() => setLocation(it.href)}
                  className="relative flex flex-col items-center justify-center rounded-xl py-1 transition-all"
                  aria-label={it.label}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-xl border transition-all"
                    style={
                      active
                        ? {
                            color: colorTheme === "pink" ? "#BE185D" : "#1D4ED8",
                            borderColor: colorTheme === "pink" ? "#FBCFE8" : "#BFDBFE",
                            background:
                              colorTheme === "pink"
                                ? "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(252,231,243,0.8), rgba(251,207,232,0.6))"
                                : "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(239,246,255,0.85), rgba(219,234,254,0.62))",
                            boxShadow:
                              colorTheme === "pink"
                                ? "0 6px 14px rgba(236,72,153,0.22)"
                                : "0 6px 14px rgba(37,99,235,0.2)",
                          }
                        : {
                            color: "#64748B",
                            borderColor: "transparent",
                            background: "transparent",
                            boxShadow: "none",
                          }
                    }
                  >
                    {it.icon}
                  </span>
                  <span
                    className={`mt-0.5 text-[9px] font-black transition-all ${
                      active ? "text-[#0F172A]" : "text-[#64748B]"
                    }`}
                  >
                    {it.label}
                  </span>
                  {active ? (
                    <span
                      className="mt-0.5 h-1 w-5 rounded-full"
                      style={{ background: colorTheme === "pink" ? "#EC4899" : "#2563EB" }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
