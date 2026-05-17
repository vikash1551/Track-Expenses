import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
const KEY = "finflow_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (stored === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(stored);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (localStorage.getItem(KEY) === "system" || !localStorage.getItem(KEY)) {
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setTheme = (next: Theme) => {
    localStorage.setItem(KEY, next);
    setThemeState(next);
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (next === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(next);
    }
  };

  return { theme, setTheme };
}
