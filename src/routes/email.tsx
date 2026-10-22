import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, OutputPanel, SubmitButton, FieldError } from "@/components/ToolKit";
import { useAi } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workly AI" },
      { name: "description", content: "Draft professional emails in formal, friendly or persuasive tones." },
      { property: "og:title", content: "Smart Email Generator — Workly AI" },
      { property: "og:description", content: "Draft professional emails in formal, friendly or persuasive tones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["formal", "friendly", "persuasive"] as const;
const DEMO = `Subject: [Sample] Project update and next steps

Dear [Recipient],

This is a sample email shown in demo mode. When AI is configured, your email will be drafted from the details you provide.

Kind regards,
[Your name]`;

function EmailPage() {
  const [f, setF] = useState({ recipient: "", purpose: "", details: "", subject: "", tone: "formal" as (typeof TONES)[number] });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const ai = useAi("email", DEMO);

  const generate = () => {
    const e: Record<string, string> = {};
    if (!f.recipient.trim()) e.recipient = "Please enter the recipient or audience.";
    if (!f.purpose.trim()) e.purpose = "Please describe the purpose of the email.";
    setErrs(e);
    if (Object.keys(e).length) return;
    ai.run([{ role: "user", content: `Recipient/audience: ${f.recipient}\nPurpose: ${f.purpose}\nKey details: ${f.details || "None provided"}\nSubject: ${f.subject || "Not specified — please write one"}\nTone: ${f.tone}` }]);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); generate(); };

  return (
    <>
      <PageHeader icon={<Mail className="size-6" />} title="Smart Email Generator" description="Describe what you need and get an editable draft." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Email details">
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="recipient">Recipient or audience *</Label>
              <Input id="recipient" className="mt-1.5" placeholder="e.g. my manager, a new client" value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} aria-invalid={!!errs.recipient} />
              <FieldError msg={errs.recipient} />
            </div>
            <div>
              <Label htmlFor="purpose">Email purpose *</Label>
              <Input id="purpose" className="mt-1.5" placeholder="e.g. request a deadline extension" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} aria-invalid={!!errs.purpose} />
              <FieldError msg={errs.purpose} />
            </div>
            <div>
              <Label htmlFor="details">Key details to include</Label>
              <Textarea id="details" className="mt-1.5 min-h-28" placeholder="Dates, numbers, context…" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input id="subject" className="mt-1.5" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Tone</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button key={t} type="button" aria-pressed={f.tone === t} onClick={() => setF({ ...f, tone: t })}
                    className={cn("rounded-full border px-4 py-1.5 text-sm capitalize transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      f.tone === t ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:bg-accent")}>
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <SubmitButton loading={ai.loading}>Generate email</SubmitButton>
          </form>
        </Panel>
        <OutputPanel title="Your email" {...ai} onRegenerate={generate} empty="Fill in the details and generate your email draft." />
      </div>
    </>
  );
}
