"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "site-theme";

function isAdminPath(pathname: string | null) {
  return pathname?.startsWith("/admin") ?? false;
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
  /** На /admin всегда тёмная тема, переключатель сайта не действует */
  isAdminSurface: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function persistTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.cookie = `${STORAGE_KEY}=${theme};path=/;max-age=31536000;sameSite=lax`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const adminSurface = isAdminPath(pathname);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    if (adminSurface) {
      applyTheme("dark");
      setMounted(true);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    applyTheme(initial);
    persistTheme(initial);
    setMounted(true);
  }, [adminSurface]);

  const setTheme = (next: Theme) => {
    if (adminSurface) return;
    setThemeState(next);
    persistTheme(next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted, isAdminSurface: adminSurface }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
