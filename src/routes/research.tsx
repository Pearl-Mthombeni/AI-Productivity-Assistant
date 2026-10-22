import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Search, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, OutputPanel, SubmitButton, FieldError } from "@/components/ToolKit";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workly AI" },
      { name: "description", content: "Summarize articles and reports into findings, implications and recommendations." },
      { property: "og:title", content: "AI Research Assistant — Workly AI" },
      { property: "og:description", content: "Summarize articles and reports into findings, implications and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResearchPage,
});

const DEMO = `## Summary
[Demo sample] This is placeholder output shown because AI isn't configured.

## Key findings
- [From your input] Sample finding
- [AI interpretation] Sample interpretation

## Potential implications
- Sample implication

## Practical recommendations
- Sample recommendation

## Limitations and open questions
- The pasted material has not been independently verified.`;

function ResearchPage() {
  const [q, setQ] = useState("");
  const [material, setMaterial] = useState("");
  const [err, setErr] = useState("");
  const ai = useAi("research", DEMO);
  const generate = () => {
    if (!q.trim() && !material.trim()) return setErr("Enter a question or paste some material to analyse.");
    setErr("");
    ai.run([{ role: "user", content: `Research question: ${q || "None — analyse the material"}\n\nUser-provided material:\n"""\n${material || "None provided"}\n"""` }]);
  };
  return (
    <>
      <PageHeader icon={<Search className="size-6" />} title="AI Research Assistant" description="Ask a question or paste an article or report." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Your research">
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); generate(); }} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="q">Research question</Label>
              <Input id="q" className="mt-1.5" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What are the benefits of hybrid work?" />
            </div>
            <div>
              <Label htmlFor="material">Article or report (optional)</Label>
              <Textarea id="material" className="mt-1.5 min-h-64" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Paste text here…" />
            </div>
            <FieldError msg={err} />
            <p className="flex gap-2 text-xs text-muted-foreground"><Info className="size-4 shrink-0" />
              Results label what came from your input versus AI interpretation. Summaries of pasted material are not independently verified, and no sources are invented.</p>
            <SubmitButton loading={ai.loading}>Analyse</SubmitButton>
          </form>
        </Panel>
        <OutputPanel title="Analysis" {...ai} onRegenerate={generate} empty="Your analysis will appear here." />
      </div>
    </>
  );
}
