"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("working-set-theme", nextTheme);
    setTheme(nextTheme);
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextTheme} theme`}
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} theme`}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-icon">
        {theme === "dark" ? "☀" : "◐"}
      </span>
      <span className="theme-toggle-label">{nextTheme}</span>
    </button>
  );
}
