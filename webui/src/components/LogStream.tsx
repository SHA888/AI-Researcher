import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDownloadUrl } from "../api/logs";

export default function LogStream({ path = "" }: { path?: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Open SSE
  useEffect(() => {
    if (!path) {
      setLines([]);
      return;
    }
    const es = new EventSource(
      `/api/logs/stream?path=${encodeURIComponent(path)}`,
    );
    esRef.current = es;
    es.onmessage = (ev) => {
      if (!paused) setLines((prev) => [...prev, ev.data]);
    };
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [path, paused]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length, autoScroll]);

  const filtered = useMemo(() => {
    if (!filter) return lines;
    try {
      const re = new RegExp(filter, "i");
      return lines.filter((l) => re.test(l));
    } catch {
      return lines;
    }
  }, [lines, filter]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      // ignore
    }
  }, [lines]);

  const onClear = () => setLines([]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter (regex)"
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        />
        <button
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
          onClick={() => setAutoScroll((v) => !v)}
        >
          {autoScroll ? "Auto-scroll: On" : "Auto-scroll: Off"}
        </button>
        <button
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
          onClick={onCopy}
        >
          Copy
        </button>
        <button
          className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
          onClick={onClear}
        >
          Clear
        </button>
        {path && (
          <a
            className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500"
            href={getDownloadUrl(path)}
            target="_blank"
            rel="noreferrer"
          >
            Download
          </a>
        )}
      </div>

      <div className="h-64 overflow-auto bg-black text-green-300 text-xs p-2 rounded">
        {filtered.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
