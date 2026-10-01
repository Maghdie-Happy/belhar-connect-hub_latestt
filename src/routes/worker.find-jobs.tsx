import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/ui-kit";
import { categories, categoryEmoji } from "@/lib/data";
import { useJobs, useSavedJobs } from "@/lib/hooks";

export const Route = createFileRoute("/worker/find-jobs")({
  head: () => ({
    meta: [
      { title: "Find Jobs in Belhar — Connectly" },
      {
        name: "description",
        content:
          "Browse paid jobs near you in Belhar, Cape Town — gardening, cleaning, tutoring, plumbing and more.",
      },
      { property: "og:title", content: "Find Jobs in Belhar — Connectly" },
      { property: "og:description", content: "Local paid work, sorted by distance from you." },
    ],
  }),
  component: FindJobs,
});

function FindJobs() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const { jobs } = useJobs();
  const { saved, toggleSaved } = useSavedJobs();

  const list = jobs.filter(
    (j) =>
      (cat === "All" || j.category === cat) &&
      (q === "" ||
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.location.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppShell role="worker" title="Find Jobs" subtitle="Paid work within 5 km of Belhar Ext 13">
      <input
        className="field"
        placeholder="Search jobs, e.g. 'garden' or 'Symphony Way'"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

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
            {c === "All" ? "All" : `${categoryEmoji[c]} ${c}`}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{list.length} jobs found near you</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((j) => (
          <div key={j.id}>
            <JobCard
              job={j}
              view="worker"
              saved={saved.includes(j.id)}
              onToggleSaved={() => toggleSaved(j.id)}
            />
          </div>
        ))}
        {list.length === 0 && (
          <p className="card-surface p-8 text-center text-sm text-muted-foreground">
            No jobs match that search yet. Try another category.
          </p>
        )}
      </div>
    </AppShell>
  );
}
