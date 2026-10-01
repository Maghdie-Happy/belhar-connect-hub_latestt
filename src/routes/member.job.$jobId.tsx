import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Stars, Tag } from "@/components/ui-kit";
import { jobs, rand } from "@/lib/data";

export const Route = createFileRoute("/member/job/$jobId")({
  head: () => ({
    meta: [
      { title: "Job details — Connectly" },
      {
        name: "description",
        content: "Review applicants, ratings and details for your posted job on Connectly.",
      },
      { property: "og:title", content: "Job details — Connectly" },
      { property: "og:description", content: "Review applicants and accept a worker." },
    ],
  }),
  component: MemberJobDetail,
});

function MemberJobDetail() {
  const { jobId } = Route.useParams();
  const job = jobs.find((j) => j.id === jobId) ?? jobs[0]!;

  return (
    <AppShell role="member" title={job.title} subtitle={`Posted by you · ${job.location}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Tag label={job.category} className="bg-muted text-muted-foreground" />
              <Tag label={job.status} />
              {job.urgent && <Tag label="Urgent" />}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Budget</dt>
                <dd className="font-display text-xl font-bold text-primary">{rand(job.budget)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">When</dt>
                <dd className="font-semibold">{job.when}</dd>
              </div>
            </dl>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="relative grid h-44 place-items-center bg-[linear-gradient(135deg,var(--accent),var(--muted))] text-sm text-muted-foreground">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">
                📍
              </span>
            </div>
            <div className="p-5 text-sm">
              <span className="font-semibold">{job.location}</span>
              <p className="text-xs text-muted-foreground">
                Exact address shared with the worker once you accept them.
              </p>
            </div>
          </div>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold">
              Applicants ({job.applicants.length})
            </h2>
            <div className="space-y-3">
              {job.applicants.map((a) => (
                <div key={a.name} className="card-surface p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-display font-bold text-primary">
                        {a.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{a.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {a.skill} · {a.jobs} jobs completed
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">"{a.note}"</p>
                      </div>
                    </div>
                    <Stars rating={a.rating} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-primary !h-10 !px-4 !text-sm">✓ Accept Worker</button>
                    <Link to="/messages" className="btn-secondary !h-10 !px-4 !text-sm">
                      Message
                    </Link>
                  </div>
                </div>
              ))}
              {job.applicants.length === 0 && (
                <p className="card-surface p-8 text-center text-sm text-muted-foreground">
                  No applications yet. Jobs in Belhar usually get their first applicant within 3
                  hours.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="card-surface p-5">
            <h3 className="font-display font-bold">Manage this job</h3>
            <div className="mt-4 space-y-2">
              <button className="btn-primary w-full">Mark Complete</button>
              <button className="btn-secondary w-full">Edit job</button>
              <Link to="/member/jobs" className="btn-ghost w-full">
                Back to My Jobs
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
