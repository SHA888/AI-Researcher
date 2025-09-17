import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = localStorage.getItem("theme");
    if (v === "dark") return true;
    if (v === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [hc, setHc] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("contrast") === "hc";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const root = document.documentElement;
    if (hc) {
      root.classList.add("hc");
      localStorage.setItem("contrast", "hc");
    } else {
      root.classList.remove("hc");
      localStorage.setItem("contrast", "normal");
    }
  }, [hc]);

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-md bg-amber-400 text-black hover:bg-amber-300"
        onClick={() => setDark(false)}
        title="Light theme"
      >
        Light
      </button>
      <button
        className="px-3 py-1.5 rounded-md bg-amber-400 text-black hover:bg-amber-300"
        onClick={() => setDark(true)}
        title="Dark theme"
      >
        Dark
      </button>
      <button
        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
        onClick={() => setHc((v) => !v)}
        title="High contrast mode"
      >
        {hc ? "High Contrast: On" : "High Contrast: Off"}
      </button>
    </div>
  );
}
