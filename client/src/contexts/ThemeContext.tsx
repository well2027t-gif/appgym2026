import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ColorTheme = "blue" | "pink";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window === "undefined") return "blue";
    const stored = window.localStorage.getItem("app_color_theme");
    return stored === "blue" || stored === "pink" ? stored : "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-blue", "theme-pink");
    root.classList.add(colorTheme === "pink" ? "theme-pink" : "theme-blue");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_color_theme", colorTheme);
    }
  }, [colorTheme]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
