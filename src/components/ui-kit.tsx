import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { rand, type Job } from "@/lib/data";

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`}>
      <span className="text-secondary">★</span>
      {rating.toFixed(1)}
    </span>
  );
}

const tagStyles: Record<string, string> = {
  Open: "bg-accent text-primary",
  Hired: "bg-accent text-primary",
  Shortlisted: "bg-accent text-primary",
  "In Progress": "bg-blue-50 text-blue-700",
  Applied: "bg-blue-50 text-blue-700",
  Completed: "bg-muted text-muted-foreground",
  Rejected: "bg-muted text-muted-foreground",
  Urgent: "bg-orange-50 text-orange-700",
};

export function Tag({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`pill ${tagStyles[label] ?? "bg-muted text-muted-foreground"} ${className}`}>
      {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: string;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function JobCard({
  job,
  view,
  saved = false,
  onToggleSaved,
}: {
  job: Job;
  view: "member" | "worker";
  saved?: boolean;
  onToggleSaved?: () => void;
}) {
  const to = view === "member" ? "/member/job/$jobId" : "/worker/job/$jobId";
  return (
    <article className="card-surface flex flex-col gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag label={job.category} className="bg-muted text-muted-foreground" />
            {job.urgent && <Tag label="Urgent" />}
            <Tag label={job.status} />
          </div>
          <h3 className="mt-2 font-display text-base font-bold">{job.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-lg font-bold text-primary">{rand(job.budget)}</div>
          <div className="text-xs text-muted-foreground">{job.distanceKm} km away</div>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>📍 {job.location}</span>
        <span>🗓 {job.when}</span>
        <span className="inline-flex items-center gap-1">
          👤 {job.postedBy} <Stars rating={job.clientRating} className="text-xs" />
        </span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={to} params={{ jobId: job.id }} className="btn-primary !h-10 !px-4 !text-sm">
          {view === "worker" ? "Apply Now" : "View job"}
        </Link>
        <Link to="/messages" className="btn-secondary !h-10 !px-4 !text-sm">
          Message
        </Link>
        {view === "worker" && onToggleSaved && (
          <button
            type="button"
            className={`btn-ghost !px-3 ${saved ? "text-primary" : ""}`}
            aria-label={saved ? "Remove saved job" : "Save job"}
            onClick={onToggleSaved}
          >
            {saved ? "♥" : "♡"}
          </button>
        )}
      </div>
    </article>
  );
}
