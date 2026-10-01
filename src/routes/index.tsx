import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { LogoMark } from "@/components/Logo";
import { categories, categoryEmoji, testimonials } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connectly — Connect. Hire. Earn. | Belhar job marketplace" },
      {
        name: "description",
        content:
          "Post a job or find local work in Belhar, Cape Town. Connectly connects community members with trusted gardeners, cleaners, tutors, handymen and more.",
      },
      { property: "og:title", content: "Connectly — Connect. Hire. Earn." },
      {
        property: "og:description",
        content: "Belhar's community job marketplace. Post a job or find work close to home.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="bg-[linear-gradient(150deg,var(--primary),var(--primary-dark))] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" onDark />

            <span className="font-display text-2xl font-extrabold">Connectly</span>
          </div>
          <h1 className="mt-8 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Connect. Hire. Earn.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            The community job marketplace for Belhar, Cape Town. Neighbours who need a hand, meet
            local people ready to work — from Ext 15 to Symphony Way.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <CtaCard
              emoji="🙋🏽"
              title="I need help"
              body="Post a job in under two minutes and get applications from vetted workers in your area."
              cta="Post a Job"
              to="/signup"
            />
            <CtaCard
              emoji="🧰"
              title="I want to work"
              body="Browse paid jobs close to home, apply instantly and build your rating and income."
              cta="Find Jobs"
              to="/worker/find-jobs"
            />
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-8 text-center sm:max-w-lg sm:text-left">
            {[
              ["1 340+", "Belhar members"],
              ["R412k", "Paid to workers"],
              ["4.8★", "Average rating"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold">{v}</dt>
                <dd className="text-xs text-white/70">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold">How Connectly works</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          Three simple steps, whether you're hiring or looking for work.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["1", "Post or browse", "Describe the job and your budget in Rand, or scroll jobs near you."],
            ["2", "Choose your person", "Compare ratings, reviews and distance, then chat before you commit."],
            ["3", "Get it done & pay", "Mark the job complete, release payment and leave a review."],
          ].map(([n, t, b]) => (
            <div key={n} className="card-surface p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent font-display text-lg font-bold text-primary">
                {n}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Popular in Belhar</h2>
          <p className="mt-2 text-muted-foreground">The work our community asks for most.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c}
                to="/worker/find-jobs"
                className="card-surface flex flex-col items-start gap-2 p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <span className="text-2xl" aria-hidden="true">
                  {categoryEmoji[c]}
                </span>
                <span className="font-display font-bold">{c}</span>
                <span className="text-xs text-muted-foreground">
                  from R{c === "Tutor" ? 200 : 350}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">From the community</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="card-surface flex h-full flex-col p-6">
              <div className="text-secondary" aria-label={`${t.rating} out of 5`}>
                {"★".repeat(t.rating)}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="card-surface flex flex-col items-center gap-5 bg-accent p-10 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to connect with your neighbours?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Joining Connectly is free for community members and workers alike.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-primary">
              Create your account
            </Link>
            <Link to="/about" className="btn-secondary">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function CtaCard({
  emoji,
  title,
  body,
  cta,
  to,
}: {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-6 shadow-[var(--shadow-lift)]">
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <h2 className="mt-3 font-display text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link to={to} className="btn-primary mt-5 w-full">
        {cta}
      </Link>
    </div>
  );
}
