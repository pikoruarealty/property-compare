import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
export type Palette = "cloud" | "warm-sand" | "sage" | "emerald" | "ocean";

type Ctx = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  palette: Palette;
  setPalette: (p: Palette) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "pikorua-theme";
const PALETTE_KEY = "pikorua-palette";

export const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: "warm-sand", label: "Warm Sand", swatch: "#b8894a" },
  { id: "cloud", label: "Tan & Teal", swatch: "#2d7a8a" },
  { id: "ocean", label: "Ocean Mist", swatch: "#475569" },
  { id: "sage", label: "Sage", swatch: "#7d9b76" },
  { id: "emerald", label: "Emerald", swatch: "#0d7a5f" },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [palette, setPaletteState] = useState<Palette>("cloud");

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);
    const storedPalette = (typeof window !== "undefined" && localStorage.getItem(PALETTE_KEY)) as Palette | null;
    if (storedPalette && ["cloud", "warm-sand", "sage", "emerald", "ocean"].includes(storedPalette)) {
      setPaletteState(storedPalette);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    try {
      localStorage.setItem(PALETTE_KEY, palette);
    } catch {}
  }, [palette]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));
  const setPalette = (p: Palette) => setPaletteState(p);

  return (
    <ThemeCtx.Provider value={{ theme, toggle, setTheme, palette, setPalette }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
