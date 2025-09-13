import { useEffect, useState } from "react";

function App() {
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
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">AI-Researcher</h1>
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
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <section className="p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
          <h2 className="text-base font-medium mb-2">Welcome</h2>
          <p className="text-sm opacity-80">
            This is the new React/Vite/Tailwind frontend scaffold. Use the theme
            buttons above to toggle light/dark.
          </p>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
          >
            <div className="font-medium">Run</div>
            <div className="text-sm opacity-80">
              Start a run and watch live logs.
            </div>
          </a>
          <a
            href="#"
            className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
          >
            <div className="font-medium">Environment</div>
            <div className="text-sm opacity-80">
              Edit API keys and task settings.
            </div>
          </a>
        </section>
      </main>
    </div>
  );
}

export default App;
