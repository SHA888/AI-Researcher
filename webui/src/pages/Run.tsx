import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  getRunStatus,
  startRun,
  type RunRequest,
  type RunStatus,
} from "../api/run";
import LogStream from "../components/LogStream";

export default function Run() {
  const [question, setQuestion] = useState("");
  const [reference, setReference] = useState("");
  const [mode, setMode] = useState("task1");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<RunStatus | null>(null);
  const timerRef = useRef<number | null>(null);

  const startMutation = useMutation({
    mutationFn: (body: RunRequest) => startRun(body),
    onSuccess: (data) => {
      setJobId(data.job_id);
    },
  });

  useEffect(() => {
    async function poll() {
      if (!jobId) return;
      const s = await getRunStatus(jobId);
      setStatus(s);
      if (s.status === "running") {
        timerRef.current = window.setTimeout(poll, 1000);
      }
    }

    if (jobId) {
      // initial poll immediately, then loop
      void poll();
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [jobId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setJobId(null);
    startMutation.mutate({ question, reference, mode });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Run</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Question</label>
          <textarea
            className="w-full min-h-24 px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Describe your research task or prompt"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Reference</label>
          <textarea
            className="w-full min-h-24 px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Optional reference(s) or notes"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Mode</label>
          <input
            className="w-48 px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            placeholder="e.g. task1"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? "Starting…" : "Start Run"}
          </button>
          {jobId && <div className="text-sm opacity-80">Job: {jobId}</div>}
        </div>
      </form>

      <div className="space-y-2">
        <div className="text-sm">
          Status:{" "}
          <span className="font-mono">
            {status?.status ?? (jobId ? "running" : "idle")}
          </span>
          {status?.error && (
            <span className="text-red-500"> — {status.error}</span>
          )}
        </div>
        <div>
          <LogStream path={status?.log_path ?? ""} />
        </div>
      </div>
    </div>
  );
}
