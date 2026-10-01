import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Connectly works — About our Belhar marketplace" },
      {
        name: "description",
        content:
          "Learn how Connectly connects Belhar community members with local workers: posting jobs, applying, ratings, safety and payment.",
      },
      { property: "og:title", content: "How Connectly works" },
      {
        property: "og:description",
        content: "How Belhar neighbours hire local workers safely on Connectly.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold">Built in Belhar, for Belhar</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Connectly started with a simple observation: people along Symphony Way stand for hours
          hoping for piece work, while two streets away someone is searching Facebook groups for a
          reliable painter. We built a place where those two people find each other.
        </p>

        <div className="mt-12 space-y-8">
          <Block
            title="For Community Members"
            steps={[
              "Post the job with a clear description, a Rand budget and the date you need it done.",
              "Workers nearby apply. You see their rating, completed jobs and reviews before deciding.",
              "Chat in the app, accept the worker you trust, then mark the job complete when it's finished.",
            ]}
          />
          <Block
            title="For Workers"
            steps={[
              "Create a profile, pick your skills and set your experience level.",
              "Browse jobs sorted by distance from you — most are under 5 km.",
              "Apply, get hired, get paid, and build the rating that brings the next job.",
            ]}
          />
        </div>

        <div className="card-surface mt-12 p-6">
          <h2 className="font-display text-xl font-bold">Safety and trust</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Every profile carries a public rating and written reviews from real jobs.</li>
            <li>• Chat stays inside Connectly until you're comfortable sharing contact details.</li>
            <li>• Report a member and our Belhar community team reviews within 24 hours.</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/signup" className="btn-primary">
            Join Connectly
          </Link>
          <Link to="/worker/find-jobs" className="btn-secondary">
            Browse jobs first
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Block({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-sm text-muted-foreground">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
