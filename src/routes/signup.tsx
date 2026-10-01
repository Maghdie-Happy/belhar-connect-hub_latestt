import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { categories } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Connectly Belhar" },
      {
        name: "description",
        content:
          "Create a free Connectly account as a Community Member to post jobs, or as a Worker to find paid work in Belhar, Cape Town.",
      },
      { property: "og:title", content: "Sign up for Connectly" },
      { property: "og:description", content: "Join Belhar's community job marketplace — free." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const [role, setRole] = useState<"member" | "worker">("member");
  const [skills, setSkills] = useState<string[]>(["Gardener"]);
  const [experience, setExperience] = useState("Entry Level");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    location: "Belhar, Cape Town",
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const confirmationUrl = () => `${window.location.origin}/login?confirmed=1`;

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (role === "worker" && skills.length === 0) {
      setError("Choose at least one skill to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: confirmationUrl(),
          data: {
            full_name: form.fullName.trim(),
            role,
            phone: form.phone.trim(),
            location: form.location.trim(),
            skills: role === "worker" ? skills : [],
            experience: role === "worker" ? experience : null,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("We could not create your account. Please try again.");

      if (data.session) {
        toast.success("Your account is ready.");
        navigate({ to: role === "member" ? "/member/dashboard" : "/worker/dashboard" });
        return;
      }

      setConfirmationEmail(form.email.trim());
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Could not create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resendConfirmation = async () => {
    if (!confirmationEmail || resending) return;
    setError(null);
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: { emailRedirectTo: confirmationUrl() },
      });
      if (resendError) throw resendError;
      toast.success("A new confirmation email has been sent.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Could not resend the confirmation email.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="flex flex-1 flex-col bg-[linear-gradient(150deg,var(--primary),var(--primary-dark))] text-white">
        <div className="mx-auto w-full max-w-xl flex-1 px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold">Create your account</h1>
          <p className="mt-2 text-sm text-white/80">Free to join. It takes about two minutes.</p>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-white/15 p-1">
            <RoleTab active={role === "member"} onClick={() => setRole("member")}>
              🙋🏽 I need help
            </RoleTab>
            <RoleTab active={role === "worker"} onClick={() => setRole("worker")}>
              🧰 I want to work
            </RoleTab>
          </div>

          {confirmationEmail ? (
            <div className="card-surface mt-6 space-y-4 p-6 text-foreground">
              <div
                className="grid h-12 w-12 place-items-center rounded-full bg-accent text-2xl text-primary"
                aria-hidden="true"
              >
                ✉
              </div>
              <h2 className="font-display text-xl font-bold">Check your email</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We sent a confirmation link to{" "}
                <strong className="text-foreground">{confirmationEmail}</strong>. Open the email and
                confirm your address before logging in.
              </p>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="btn-secondary w-full"
              >
                {resending ? "Sending…" : "Resend confirmation email"}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Confirmed already?{" "}
                <Link to="/login" className="font-semibold text-primary">
                  Log in
                </Link>
              </p>
            </div>
          ) : (
            <form
              className="card-surface mt-6 space-y-5 p-6 text-foreground"
              onSubmit={handleSignUp}
            >
              <Field label="Full name">
                <input
                  required
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  className="field"
                  placeholder="e.g. Fatima Adams"
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </Field>
              <Field label="Email address">
                <input
                  required
                  autoComplete="email"
                  className="field"
                  type="email"
                  placeholder="you@example.co.za"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Field>
              <Field label="Phone number">
                <input
                  required
                  autoComplete="tel"
                  className="field"
                  type="tel"
                  placeholder="072 123 4567"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </Field>
              <Field label="Password">
                <input
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="field"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </Field>
              <Field label="Location">
                <input
                  required
                  className="field"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </Field>

              {role === "worker" && (
                <>
                  <Field label="Your skills">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const on = skills.includes(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => toggleSkill(c)}
                            className={`pill border ${
                              on
                                ? "border-primary bg-accent text-primary"
                                : "border-border bg-surface text-muted-foreground"
                            }`}
                          >
                            {on ? "✓ " : "+ "}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Experience level">
                    <select
                      className="field"
                      value={experience}
                      onChange={(event) => setExperience(event.target.value)}
                    >
                      <option>Entry Level</option>
                      <option>Intermediate</option>
                      <option>Expert</option>
                    </select>
                  </Field>
                </>
              )}

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  checked={form.termsAccepted}
                  onChange={(event) => setForm({ ...form, termsAccepted: event.target.checked })}
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                />
                <span>
                  I agree to the Connectly Terms of Service and{" "}
                  <Link to="/community-guidelines" className="font-semibold text-primary underline">
                    Community Guidelines
                  </Link>{" "}
                  for Belhar members.
                </span>
              </label>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                disabled={submitting}
                type="submit"
                className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
              >
                {submitting
                  ? "Creating account…"
                  : `Create ${role === "member" ? "Community Member" : "Worker"} account`}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}

function RoleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
        active ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
