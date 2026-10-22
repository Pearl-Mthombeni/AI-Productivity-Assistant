import { useCallback, useRef, useState } from "react";

export type AiMessage = { role: "user" | "assistant"; content: string };
export type Tool = "email" | "notes" | "planner" | "research" | "chat";

/** Streams text from the server AI route. Falls back to a labelled demo when AI isn't configured. */
export function useAi(tool: Tool, demoText: string) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (messages: AiMessage[], onChunk?: (full: string) => void): Promise<string | null> => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      setIsDemo(false);
      setOutput("");
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool, messages }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { demo?: boolean; error?: string };
          if (data.demo) {
            setIsDemo(true);
            setOutput(demoText);
            onChunk?.(demoText);
            return demoText;
          }
          throw new Error(data.error || `Request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setOutput(full);
          onChunk?.(full);
        }
        if (!full.trim()) throw new Error("The AI returned an empty response. Please try again.");
        return full;
      } catch (e) {
        if ((e as Error).name === "AbortError") return null;
        setError((e as Error).message || "Something went wrong.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tool, demoText],
  );

  return { output, setOutput, loading, error, isDemo, run };
}
