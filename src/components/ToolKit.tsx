import { useState, type ReactNode } from "react";
import { Copy, Check, Loader2, AlertCircle, RefreshCw, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PageHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">{icon}</span>
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
          <label htmlFor="ai-output" className="sr-only">Editable result</label>
          <Textarea
            id="ai-output"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            readOnly={loading}
            className="min-h-[360px] font-sans text-sm leading-relaxed"
          />
          <p className="mt-2 text-xs text-muted-foreground">You can edit this result. Review before using it.</p>
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
