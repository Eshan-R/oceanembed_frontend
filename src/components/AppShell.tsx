import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  LineChart,
  Cpu,
  Waves,
  Wind,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home / Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Ocean Map", icon: Map },
  { to: "/profile", label: "Vertical Profile Viewer", icon: LineChart },
  { to: "/prediction", label: "Prediction Panel", icon: Cpu },
  { to: "/model", label: "Model & Physics", icon: Waves },
  { to: "/cyclone", label: "Cyclone Simulation", icon: Wind },
  { to: "/about", label: "About / Documentation", icon: BookOpen },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-primary px-3 text-primary-foreground sm:px-4">
        <button
          className="rounded p-1.5 hover:bg-white/10 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden size-7 shrink-0 place-items-center rounded-sm border border-white/25 sm:grid">
            <Waves className="size-4" aria-hidden />
          </div>
          <h1 className="truncate text-[0.9375rem] font-semibold tracking-tight sm:text-base">
            Subsurface Ocean Temperature Reconstruction
          </h1>
        </div>
        <span className="ml-auto shrink-0 rounded-sm border border-white/25 px-2 py-1 text-[0.6875rem] font-medium tracking-wide text-primary-foreground/90">
          North Indian Ocean
        </span>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="sticky top-14">
            <p className="label-caps px-5 pt-4 pb-1 text-sidebar-foreground/55">
              Navigation
            </p>
            <NavList />
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/50"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-sidebar">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="label-caps text-sidebar-foreground/55">Navigation</p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="rounded p-1 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>

      <footer className="border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Data: CMEMS GLORYS12V1 Reanalysis</span>
          <span>
            Research prototype &middot; mock data shown pending model API integration
          </span>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
