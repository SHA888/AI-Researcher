import { NavLink, Route, Routes } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import Run from "./pages/Run";
import Env from "./pages/Env";
import Logs from "./pages/Logs";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">AI-Researcher</h1>
            <nav className="text-sm flex items-center gap-4">
              <NavLink
                to="/"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "font-medium" : "opacity-80 hover:opacity-100"
                }
                end
              >
                Home
              </NavLink>
              <NavLink
                to="/run"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "font-medium" : "opacity-80 hover:opacity-100"
                }
              >
                Run
              </NavLink>
              <NavLink
                to="/env"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "font-medium" : "opacity-80 hover:opacity-100"
                }
              >
                Env
              </NavLink>
              <NavLink
                to="/logs"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? "font-medium" : "opacity-80 hover:opacity-100"
                }
              >
                Logs
              </NavLink>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/run" element={<Run />} />
          <Route path="/env" element={<Env />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
