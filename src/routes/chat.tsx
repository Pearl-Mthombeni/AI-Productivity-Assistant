import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageSquare, Send, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, ErrorBox, DemoBadge, CopyButton } from "@/components/ToolKit";
import { useAi, type AiMessage } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Workly AI" },
      { name: "description", content: "Chat with an AI assistant about workplace and productivity questions." },
      { property: "og:title", content: "AI Chat — Workly AI" },
      { property: "og:description", content: "Chat with an AI assistant about workplace and productivity questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

const DEMO = "[Demo sample] AI isn't configured, so this is a placeholder reply rather than a live AI response.";
const SUGGESTIONS = ["How can I run shorter meetings?", "Help me prioritise a busy week", "How do I give constructive feedback?"];

function ChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const ai = useAi("chat", DEMO);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || ai.loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setStreaming("");
    const reply = await ai.run(next, setStreaming);
    setStreaming("");
    if (reply) setMessages([...next, { role: "assistant", content: reply }]);
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader icon={<MessageSquare className="size-6" />} title="AI Chat" description="Ask workplace and productivity questions. Follow-ups keep context." />
        <Button variant="outline" onClick={() => { setMessages([]); setStreaming(""); }} disabled={ai.loading}>
          <Plus className="size-4" /> New conversation
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4" aria-live="polite">
        {messages.length === 0 && !ai.loading && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-muted-foreground">Start a conversation, or try one of these:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((m, i) => <Bubble key={i} m={m} />)}
        {ai.loading && (streaming ? <Bubble m={{ role: "assistant", content: streaming }} /> : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Thinking…</div>
        ))}
        {ai.isDemo && <DemoBadge />}
        {ai.error && <ErrorBox msg={ai.error} />}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e: FormEvent) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <label htmlFor="chat-input" className="sr-only">Message</label>
        <Textarea id="chat-input" value={input} onChange={(e) => setInput(e.target.value)} rows={2} className="min-h-12 resize-none"
          placeholder="Type your question… (Enter to send, Shift+Enter for new line)"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} />
        <Button type="submit" size="lg" disabled={!input.trim() || ai.loading} aria-label="Send message" className="h-auto">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ m }: { m: AiMessage }) {
  const user = m.role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div className={cn("group max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
        user ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {m.content}
        {!user && <div className="mt-2 opacity-70"><CopyButton text={m.content} /></div>}
      </div>
    </div>
  );
}
