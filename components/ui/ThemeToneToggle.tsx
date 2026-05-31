"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToneToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("velmere-tone");
    const next = stored === "light";
    setLight(next);
    document.documentElement.classList.toggle("velmere-light", next);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("velmere-light", next);
    window.localStorage.setItem("velmere-tone", next ? "light" : "dark");
    navigator.vibrate?.(20);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Use dark tone" : "Use light tone"}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/62 transition hover:border-white/22 hover:text-white active:scale-95"
    >
      {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
