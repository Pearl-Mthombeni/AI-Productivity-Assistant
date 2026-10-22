import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Mail, FileText, CalendarCheck, Search, MessageSquare, Menu, X, Sun, Moon, ShieldAlert, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/notes", label: "Notes Summarizer", icon: FileText },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research", icon: Search },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-sidebar-accent-foreground">Workly AI</span>
        <span className="block text-xs text-sidebar-foreground/70">by CAPACITI</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-sidebar-primary")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(localStorage.getItem("workly-theme") === "light");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    localStorage.setItem("workly-theme", next ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Logo />
        <NavList />
        <p className="mt-auto rounded-lg bg-sidebar-accent/60 p-3 text-xs leading-relaxed text-sidebar-foreground">
          Verify important outputs. Avoid entering confidential or sensitive information.
        </p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-background/70" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-sidebar p-5">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent">
                <X className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-md p-2 hover:bg-accent lg:hidden">
            <Menu className="size-5" />
          </button>
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0 text-warning" aria-hidden />
            <span className="truncate">AI-generated content may require human review.</span>
          </p>
          <button
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
            className="rounded-lg border border-border p-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
