import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Welcome</h2>
      <p className="text-sm opacity-80">
        Use the navigation to manage environment variables, start runs, and view
        logs.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/run"
          className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
        >
          <div className="font-medium">Run</div>
          <div className="text-sm opacity-80">
            Start a run and watch live logs.
          </div>
        </Link>
        <Link
          to="/env"
          className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
        >
          <div className="font-medium">Environment</div>
          <div className="text-sm opacity-80">
            Edit API keys and task settings.
          </div>
        </Link>
        <Link
          to="/logs"
          className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
        >
          <div className="font-medium">Logs</div>
          <div className="text-sm opacity-80">Browse and search logs.</div>
        </Link>
      </div>
    </div>
  );
}
