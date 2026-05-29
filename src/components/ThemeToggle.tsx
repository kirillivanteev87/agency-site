"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const isLight = theme === "light";

  if (!mounted) {
    return <div className="theme-toggle h-9 w-[4.25rem] shrink-0" aria-hidden />;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Светлая тема включена" : "Тёмная тема включена"}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="theme-toggle"
    >
      <Moon
        size={15}
        strokeWidth={2}
        className={`shrink-0 transition-colors ${isLight ? "text-[var(--text-muted)]" : "text-accent"}`}
        aria-hidden
      />
      <span className="theme-toggle-track" aria-hidden>
        <span className={`theme-toggle-thumb ${isLight ? "is-light" : ""}`} />
      </span>
      <Sun
        size={15}
        strokeWidth={2}
        className={`shrink-0 transition-colors ${isLight ? "text-accent" : "text-[var(--text-muted)]"}`}
        aria-hidden
      />
    </button>
  );
}
