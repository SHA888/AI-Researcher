import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const v = localStorage.getItem("theme");
    if (v === "dark") return true;
    if (v === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
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

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-md bg-amber-400 text-black hover:bg-amber-300"
        onClick={() => setDark(false)}
      >
        Light
      </button>
      <button
        className="px-3 py-1.5 rounded-md bg-amber-400 text-black hover:bg-amber-300"
        onClick={() => setDark(true)}
      >
        Dark
      </button>
    </div>
  );
}
