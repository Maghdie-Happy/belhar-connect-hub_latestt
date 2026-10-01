import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JobCard, StatCard, Section } from "@/components/ui-kit";
import { categories, categoryEmoji } from "@/lib/data";
import { useJobs } from "@/lib/hooks";

export const Route = createFileRoute("/member/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — Connectly" },
      {
        name: "description",
        content: "Track your posted jobs, active hires and applicants on Connectly.",
      },
      { property: "og:title", content: "Member Dashboard — Connectly" },
      { property: "og:description", content: "Manage your Belhar job posts in one place." },
    ],
  }),
  component: MemberDashboard,
});

function MemberDashboard() {
  const [cat, setCat] = useState<string>("All");
  const { jobs } = useJobs();
  const list = cat === "All" ? jobs : jobs.filter((j) => j.category === cat);

  return (
    <AppShell
      role="member"
      title="Goeie dag, Fatima 👋"
      subtitle="Belhar Ext 15, Cape Town"
      action={
        <Link to="/member/post-job" className="btn-primary">
          ➕ Post a New Job
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Jobs posted" value="12" hint="Since March 2026" icon="📋" />
        <StatCard label="Active jobs" value="3" hint="1 starts Saturday" icon="⏳" />
        <StatCard label="Workers hired" value="9" hint="7 rated 5 stars" icon="🤝" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`pill shrink-0 border ${
              cat === c
                ? "border-primary bg-accent text-primary"
                : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {c === "All" ? "All jobs" : `${categoryEmoji[c]} ${c}`}
          </button>
        ))}
      </div>

      <Section
        title="Your recent job posts"
        action={
          <Link to="/member/jobs" className="text-sm font-semibold text-primary">
            View all
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((j) => (
            <JobCard key={j.id} job={j} view="member" />
          ))}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs in this category yet.</p>
          )}
        </div>
      </Section>
    </AppShell>
  );
}
