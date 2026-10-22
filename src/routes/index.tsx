import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarCheck, Search, MessageSquare, ArrowRight, Clock, Zap, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workly AI by CAPACITI" },
      { name: "description", content: "Your AI workplace assistant: draft emails, summarize meetings, plan your week and research smarter." },
      { property: "og:title", content: "Workly AI — Your AI workplace assistant" },
      { property: "og:description", content: "Draft emails, summarize meetings, plan your week and research smarter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { icon: Clock, value: "Up to 5 hrs", label: "Weekly time that could be saved" },
  { icon: Zap, value: "~3× faster", label: "Drafting for routine workflows" },
  { icon: PencilLine, value: "100%", label: "Of outputs editable before use" },
];

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft clear, on-tone emails from a few key details." },
  { to: "/notes", icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn notes or transcripts into decisions and action items." },
  { to: "/planner", icon: CalendarCheck, title: "AI Task Planner", desc: "Build a realistic schedule with breaks and priorities." },
  { to: "/research", icon: Search, title: "AI Research Assistant", desc: "Summarize reports and surface findings and limitations." },
  { to: "/chat", icon: MessageSquare, title: "AI Chat", desc: "Ask workplace and productivity questions, with follow-ups." },
] as const;

function Dashboard() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-hero p-8 md:p-12">
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">Your AI workplace assistant</h1>
        <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
          Automate emails, summarize meetings, plan your week and research smarter — with results you can review and edit.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/email">Start with Email <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="purple">
            <Link to="/chat">Open AI Chat</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="stats">
        <h2 id="stats" className="sr-only">Illustrative estimates</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <Icon className="size-5 text-info" aria-hidden />
              <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Illustrative estimates only — not measured from your usage. Actual results vary.</p>
      </section>

      <section aria-labelledby="tools">
        <h2 id="tools" className="mb-4 text-xl font-semibold">Productivity tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:-translate-y-0.5 hover:border-info/60 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-info/15 text-info"><Icon className="size-5" /></span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open tool <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
