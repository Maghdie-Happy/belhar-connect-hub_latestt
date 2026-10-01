import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { JobCard, StatCard, Section } from "@/components/ui-kit";
import { applications as sampleApplications, weeklyEarnings } from "@/lib/data";
import { useApplications, useAvailability, useJobs } from "@/lib/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/lib/auth";
import { formatCurrency, readWorkerWallet } from "@/lib/worker-wallet";

export const Route = createFileRoute("/worker/dashboard")({
  head: () => ({
    meta: [
      { title: "Worker Dashboard — Connectly" },
      {
        name: "description",
        content: "See recommended jobs near you, your rating and earnings on Connectly.",
      },
      { property: "og:title", content: "Worker Dashboard — Connectly" },
      { property: "og:description", content: "Your work, rating and income in Belhar." },
    ],
  }),
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const { available, toggleAvailability } = useAvailability();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { applied } = useApplications();
  const { profile } = useProfile();
  const openJobs = jobs
    .filter((job) => job.status === "Open" && !applied.includes(job.id))
    .sort((first, second) => {
      const firstMatch = profile?.skills?.includes(first.category) ? 1 : 0;
      const secondMatch = profile?.skills?.includes(second.category) ? 1 : 0;
      return secondMatch - firstMatch || first.distanceKm - second.distanceKm;
    })
    .slice(0, 4);
  const savedApplications = jobs.filter((job) => applied.includes(job.id)).map((job) => job.title);
  const appliedCount = new Set([
    ...sampleApplications.Applied.map((application) => application.job),
    ...savedApplications,
  ]).size;
  const wallet = readWorkerWallet();
  const weeklyTotal = weeklyEarnings.reduce((sum, day) => sum + day.amount, 0);
  const completedJobs =
    profile?.jobs_done ?? jobs.filter((job) => job.status === "Completed").length;
  const name = profile?.full_name || "Worker";
  const role = profile?.skills?.[0] || "Local worker";
  const location = profile?.location || "Belhar, Cape Town";

  return (
    <AppShell
      role="worker"
      title={`Molo, ${name.split(" ")[0]}!`}
      subtitle={`${role} · ${location}`}
      action={
        <button
          type="button"
          onClick={toggleAvailability}
          aria-pressed={available}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 transition-colors hover:bg-muted"
          title={available ? "Click to go offline" : "Click to go online"}
        >
          <span className="text-sm font-semibold">
            {available ? "Available for work" : "Not available"}
          </span>
          <span
            className={`relative h-7 w-12 rounded-full transition-colors ${
              available ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                available ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/worker/applications" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard
              label="Completed jobs"
              value={String(completedJobs)}
              hint="View your applications"
              icon="✅"
            />
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/earnings" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard
              label="Total earned"
              value={formatCurrency(wallet.totalEarned)}
              hint={`${formatCurrency(weeklyTotal)} this week`}
              icon="💰"
            />
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="card-surface text-left transition-colors hover:bg-muted"
        >
          <div className="p-5">
            <StatCard
              label="Rating"
              value={profile?.rating ? `${profile.rating.toFixed(1)}★` : "New"}
              hint={`${profile?.jobs_done ?? 0} completed jobs`}
              icon="⭐"
            />
          </div>
        </button>
      </div>

      <Section
        title="Recommended for you"
        action={
          <Link
            to="/worker/find-jobs"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See all jobs
          </Link>
        }
      >
        {openJobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {openJobs.map((job) => (
              <JobCard key={job.id} job={job} view="worker" />
            ))}
          </div>
        ) : (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No open jobs right now. Check back soon!
          </div>
        )}
      </Section>

      <Section
        title="My applications"
        action={
          <Link
            to="/worker/applications"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Applied", appliedCount],
            ["Shortlisted", sampleApplications.Shortlisted.length],
            ["Hired", sampleApplications.Hired.length],
            ["Rejected", sampleApplications.Rejected.length],
          ].map(([label, n]) => (
            <button
              type="button"
              key={label as string}
              onClick={() => navigate({ to: "/worker/applications" })}
              className="card-surface p-5 transition-colors hover:bg-muted"
            >
              <div className="font-display text-2xl font-bold">{n}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </button>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
