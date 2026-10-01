import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { initials, useProfile, useSignOut } from "@/lib/auth";

type NavItem = { label: string; to: string; icon: string };

const memberNav: NavItem[] = [
  { label: "Dashboard", to: "/member/dashboard", icon: "🏠" },
  { label: "Post a Job", to: "/member/post-job", icon: "➕" },
  { label: "My Jobs", to: "/member/jobs", icon: "📋" },
  { label: "Messages", to: "/messages", icon: "💬" },
  { label: "Notifications", to: "/notifications", icon: "🔔" },
  { label: "Profile", to: "/profile", icon: "👤" },
  { label: "Settings", to: "/settings", icon: "⚙️" },
];

const workerNav: NavItem[] = [
  { label: "Dashboard", to: "/worker/dashboard", icon: "🏠" },
  { label: "Find Jobs", to: "/worker/find-jobs", icon: "🔎" },
  { label: "My Applications", to: "/worker/applications", icon: "📨" },
  { label: "Earnings", to: "/earnings", icon: "💰" },
  { label: "Messages", to: "/messages", icon: "💬" },
  { label: "Notifications", to: "/notifications", icon: "🔔" },
  { label: "Profile", to: "/profile", icon: "👤" },
  { label: "Settings", to: "/settings", icon: "⚙️" },
];

export function AppShell({
  role,
  title,
  subtitle,
  action,
  children,
}: {
  role?: "member" | "worker";
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useProfile();
  const signOut = useSignOut();

  const effectiveRole: "member" | "worker" =
    role ?? (profile?.role === "worker" ? "worker" : "member");
  const nav = effectiveRole === "member" ? memberNav : workerNav;
  const person = profile?.full_name ?? "Your account";
  const label = effectiveRole === "member" ? "Community Member" : "Worker";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
          <Logo to={effectiveRole === "member" ? "/member/dashboard" : "/worker/dashboard"} />
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative text-lg" aria-label="Notifications">
              🔔
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-secondary" />
            </Link>
            <Link to="/profile" className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-bold text-primary">
                {initials(person)}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-semibold">{person}</span>
                <span className="block text-xs text-muted-foreground">{label}</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                activeProps={{ className: "!bg-accent !text-primary font-semibold" }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <span aria-hidden="true">↩︎</span> Log out
            </button>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {action}
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="pill shrink-0 border border-border bg-surface text-muted-foreground"
                activeProps={{ className: "!bg-accent !text-primary !border-primary/30" }}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
