import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, OutputPanel, SubmitButton, FieldError, CopyButton } from "@/components/ToolKit";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workly AI" },
      { name: "description", content: "Summarize meeting notes into decisions and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer — Workly AI" },
      { property: "og:description", content: "Summarize meeting notes into decisions and action items." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotesPage,
});

const DEMO = `## Summary
[Demo sample] The team reviewed progress and agreed on next steps.

## Key discussion points
- Sample discussion point

## Decisions made
- None recorded

## Action items
- Prepare draft report — Owner: Unspecified — Deadline: Unspecified`;

function actionItems(text: string) {
  const m = text.split(/##\s*Action items/i)[1];
  return m ? m.split(/\n##\s/)[0].trim() : "";
}

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const ai = useAi("notes", DEMO);
  const generate = () => {
    if (notes.trim().length < 30) return setErr("Please paste at least a few sentences of notes.");
    setErr("");
    ai.run([{ role: "user", content: `Meeting notes/transcript:\n"""\n${notes}\n"""` }]);
  };
  const items = actionItems(ai.output);
  return (
    <>
      <PageHeader icon={<FileText className="size-6" />} title="Meeting Notes Summarizer" description="Paste notes or a transcript to extract summary, decisions and actions." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Meeting notes">
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); generate(); }} className="space-y-4" noValidate>
            <Label htmlFor="notes">Notes or transcript *</Label>
            <Textarea id="notes" className="min-h-80" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your meeting notes here…" aria-invalid={!!err} />
            <FieldError msg={err} />
            <p className="text-xs text-muted-foreground">Owners and deadlines are only included when stated in your notes.</p>
            <SubmitButton loading={ai.loading}>Summarize</SubmitButton>
          </form>
        </Panel>
        <OutputPanel title="Summary" {...ai} onRegenerate={generate} empty="Your summary and action items will appear here."
          extraActions={items ? <CopyButton text={items} label="Copy actions" /> : null} />
      </div>
    </>
  );
}
