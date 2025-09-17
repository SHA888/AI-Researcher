import { useEffect, useRef, useState } from "react";

export default function LogStream({ path = "" }: { path?: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const es = new EventSource(
      `/api/logs/stream?path=${encodeURIComponent(path)}`,
    );
    es.onmessage = (ev) => {
      setLines((prev) => [...prev, ev.data]);
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [path]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  return (
    <div className="h-64 overflow-auto bg-black text-green-300 text-xs p-2 rounded">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
