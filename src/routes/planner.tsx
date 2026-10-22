import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, Panel, OutputPanel, SubmitButton, FieldError } from "@/components/ToolKit";
import { useAi } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workly AI" },
      { name: "description", content: "Turn your tasks into a realistic daily or weekly plan with breaks." },
      { property: "og:title", content: "AI Task Planner — Workly AI" },
      { property: "og:description", content: "Turn your tasks into a realistic daily or weekly plan with breaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

type Task = { id: string; title: string; deadline: string; hours: string; priority: "high" | "medium" | "low"; done: boolean };
const DEMO = `## Schedule
[Demo sample]
09:00–10:30 · Sample task
10:30–10:45 · Break

## Tasks that do not fit
- All tasks fit

## Why this order
Sample explanation — shown because AI isn't configured.`;
const STORE = "workly-planner-tasks";

function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState({ title: "", deadline: "", hours: "1", priority: "medium" as Task["priority"] });
  const [scope, setScope] = useState<"day" | "week">("day");
  const [avail, setAvail] = useState("09:00–17:00");
  const [err, setErr] = useState("");
  const ai = useAi("planner", DEMO);

  useEffect(() => {
    try { setTasks(JSON.parse(localStorage.getItem(STORE) || "[]")); } catch { /* ignore */ }
  }, []);
  const save = (t: Task[]) => { setTasks(t); localStorage.setItem(STORE, JSON.stringify(t)); };
  const update = (id: string, p: Partial<Task>) => save(tasks.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return setErr("Please enter a task name.");
    const h = Number(draft.hours);
    if (!(h > 0 && h <= 40)) return setErr("Duration must be between 0 and 40 hours.");
    setErr("");
    save([...tasks, { ...draft, id: crypto.randomUUID(), done: false }]);
    setDraft({ title: "", deadline: "", hours: "1", priority: "medium" });
  };

  const generate = () => {
    const open = tasks.filter((t) => !t.done);
    if (!open.length) return setErr("Add at least one incomplete task to plan.");
    if (!avail.trim()) return setErr("Please enter your available working hours.");
    setErr("");
    const list = open.map((t, i) => `${i + 1}. ${t.title} — duration ${t.hours}h — priority ${t.priority} — deadline ${t.deadline || "none"}`).join("\n");
    ai.run([{ role: "user", content: `Plan type: ${scope === "day" ? "single day" : "work week (Mon–Fri)"}\nAvailable working hours: ${avail}\nToday: ${new Date().toDateString()}\nTasks:\n${list}` }]);
  };

  return (
    <>
      <PageHeader icon={<CalendarCheck className="size-6" />} title="AI Task Planner" description="Add your tasks, then generate a realistic schedule." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Add a task">
            <form onSubmit={add} className="grid gap-3 sm:grid-cols-2" noValidate>
              <div className="sm:col-span-2">
                <Label htmlFor="t-title">Task *</Label>
                <Input id="t-title" className="mt-1.5" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="t-deadline">Deadline</Label>
                <Input id="t-deadline" type="date" className="mt-1.5" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="t-hours">Duration (hours) *</Label>
                <Input id="t-hours" type="number" min="0.25" step="0.25" className="mt-1.5" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="t-pri">Priority</Label>
                <select id="t-pri" className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                  value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Task["priority"] })}>
                  <option value="high" className="bg-card">High</option>
                  <option value="medium" className="bg-card">Medium</option>
                  <option value="low" className="bg-card">Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="outline" className="w-full"><Plus className="size-4" /> Add task</Button>
              </div>
            </form>
          </Panel>

          <Panel title={`Tasks (${tasks.length})`}>
            {tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">No tasks yet — add one above.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                    <Checkbox checked={t.done} onCheckedChange={(v) => update(t.id, { done: !!v })} aria-label={`Mark ${t.title} complete`} />
                    <Input aria-label="Task name" value={t.title} onChange={(e) => update(t.id, { title: e.target.value })} className={cn("h-8 min-w-32 flex-1", t.done && "line-through opacity-60")} />
                    <Input aria-label="Hours" type="number" value={t.hours} onChange={(e) => update(t.id, { hours: e.target.value })} className="h-8 w-20" />
                    <span className={cn("rounded-full px-2 py-0.5 text-xs capitalize", t.priority === "high" ? "bg-primary/20 text-primary" : t.priority === "medium" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{t.priority}</span>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${t.title}`} onClick={() => save(tasks.filter((x) => x.id !== t.id))}><Trash2 className="size-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="mt-5 space-y-3 border-t border-border pt-4" noValidate>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="avail">Available hours *</Label>
                  <Input id="avail" className="mt-1.5" value={avail} onChange={(e) => setAvail(e.target.value)} placeholder="e.g. 09:00–17:00" />
                </div>
                <div>
                  <Label htmlFor="scope">Plan for</Label>
                  <select id="scope" value={scope} onChange={(e) => setScope(e.target.value as "day" | "week")}
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring">
                    <option value="day" className="bg-card">Today</option>
                    <option value="week" className="bg-card">This week</option>
                  </select>
                </div>
              </div>
              <FieldError msg={err} />
              <SubmitButton loading={ai.loading}>Generate plan</SubmitButton>
            </form>
          </Panel>
        </div>
        <OutputPanel title="Your plan" {...ai} onRegenerate={generate} empty="Your schedule will appear here." />
      </div>
    </>
  );
}
