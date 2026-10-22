import { useState, type ReactNode } from "react";
import { Copy, Check, Loader2, AlertCircle, RefreshCw, FlaskConical, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PageHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-info/15 text-info">{icon}</span>
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!text.trim()}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy. Please select and copy manually.");
        }
      }}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      {label}
    </Button>
  );
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  if (!msg) return null;
  return <p className="mt-1 text-sm text-destructive" role="alert">{msg}</p>;
}

export function ErrorBox({ msg }: { msg: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <span>{msg}</span>
    </div>
  );
}

export function DemoBadge() {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-2.5 text-sm">
      <FlaskConical className="size-4 text-warning" />
      Demo mode — AI isn't configured, so this is a sample response, not live AI output.
    </div>
  );
}

function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*|\[(?:From your input|AI interpretation)\])/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part === "[From your input]") return <span key={i} className="mr-1 rounded bg-info/15 px-1.5 py-0.5 text-xs text-info">From your input</span>;
    if (part === "[AI interpretation]") return <span key={i} className="mr-1 rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary">AI interpretation</span>;
    return part.split(/(Unspecified)/g).map((p, j) =>
      p === "Unspecified" ? <span key={`${i}-${j}`} className="rounded bg-warning/15 px-1 text-warning">Unspecified</span> : p);
  });
}

/** Lightweight Markdown-ish renderer for AI results (headings, bullets, numbered lists, bold). */
export function FormattedText({ text }: { text: string }) {
  return (
    <div className="max-h-[560px] min-h-[200px] space-y-2 overflow-y-auto rounded-lg border border-border bg-background/40 p-4 text-sm leading-relaxed">
      {text.split("\n").map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <div key={i} className="h-1" />;
        const h = line.match(/^#{1,4}\s+(.*)/);
        if (h) return <h3 key={i} className="pt-2 font-display text-base font-semibold text-foreground">{inline(h[1] ?? "")}</h3>;
        const b = line.match(/^\s*[-*•]\s+(.*)/);
        if (b) return <p key={i} className="flex gap-2 pl-1"><span className="text-primary">•</span><span>{inline(b[1] ?? "")}</span></p>;
        const n = line.match(/^\s*(\d+)[.)]\s+(.*)/);
        if (n) return <p key={i} className="flex gap-2 pl-1"><span className="text-primary">{n[1]}.</span><span>{inline(n[2] ?? "")}</span></p>;
        if (/^Subject:/i.test(line)) return <p key={i} className="border-b border-border pb-2 font-semibold">{line}</p>;
        return <p key={i}>{inline(line)}</p>;
      })}
    </div>
  );
}

/** Editable AI result with copy, regenerate, loading, error and empty states. */
export function OutputPanel({
  title = "Result",
  output,
  setOutput,
  loading,
  error,
  isDemo,
  onRegenerate,
  empty,
  extraActions,
}: {
  title?: string;
  output: string;
  setOutput: (s: string) => void;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  onRegenerate?: () => void;
  empty: string;
  extraActions?: ReactNode;
}) {
  const [view, setView] = useState<"preview" | "edit">("preview");
  return (
    <Panel
      title={title}
      actions={
        output && !loading ? (
          <div className="flex flex-wrap gap-2">
            {extraActions}
            <CopyButton text={output} />
            {onRegenerate && (
              <Button type="button" variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="size-4" /> Regenerate
              </Button>
            )}
          </div>
        ) : null
      }
    >
      {error && <ErrorBox msg={error} />}
      {isDemo && <DemoBadge />}
      {loading && !output && (
        <div className="flex items-center gap-2 py-10 text-muted-foreground" aria-live="polite">
          <Loader2 className="size-5 animate-spin" /> Generating…
        </div>
      )}
      {!loading && !output && !error && (
        <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">{empty}</p>
      )}
      {output && (
        <>
          <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-sm" role="tablist" aria-label="Result view">
            {(["preview", "edit"] as const).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
                className={cn("rounded-md px-3 py-1 capitalize focus-visible:outline-2 focus-visible:outline-ring",
                  view === v ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {v === "edit" ? <span className="inline-flex items-center gap-1"><Pencil className="size-3.5" /> Edit</span> : "Formatted"}
              </button>
            ))}
          </div>
          {view === "edit" && !loading ? (
            <>
              <label htmlFor="ai-output" className="sr-only">Editable result</label>
              <Textarea
                id="ai-output"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="min-h-[360px] font-sans text-sm leading-relaxed"
              />
            </>
          ) : (
            <FormattedText text={output} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">Switch to Edit to change this result. Review before using it.</p>
        </>
      )}
    </Panel>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? "Generating…" : children}
    </Button>
  );
}
