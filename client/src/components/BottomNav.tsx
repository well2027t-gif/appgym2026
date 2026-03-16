import { BarChart3, Dumbbell, Home, User } from "lucide-react";
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
    { label: "Progresso", href: "/progress", icon: <BarChart3 size={20} /> },
    { label: "Perfil", href: "/profile", icon: <User size={20} /> },
  ];

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[420px] px-4 pb-4 pt-2.5">
        <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-[#DBEAFE] shadow-2xl px-3 py-2">
          <div className="grid grid-cols-4 gap-1">
            {items.map((it) => {
              const active = isActive(it.href);
              return (
                <button
                  key={it.href}
                  onClick={() => setLocation(it.href)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${
                    active ? "text-[#1D4ED8]" : "text-[#64748B]"
                  }`}
                  style={
                    active
                      ? {
                          background:
                            colorTheme === "pink"
                              ? "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(244,114,182,0.10))"
                              : "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(59,130,246,0.10))",
                        }
                      : undefined
                  }
                >
                  <span className={active ? "drop-shadow-sm" : ""}>{it.icon}</span>
                  <span className="text-[10px] font-black">{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

