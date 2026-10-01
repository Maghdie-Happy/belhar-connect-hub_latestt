import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/lib/data";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dashboardPath = role === "member" ? "/member/dashboard" : "/worker/dashboard";

  const toggleSkill = (skill: string) =>
    setSkills((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const emailRedirectTo = `${window.location.origin}/login?confirmed=1`;
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const location = String(formData.get("location") ?? "").trim();
    const experience = String(formData.get("experience") ?? "Entry Level");

    if (!fullName || !location || !/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
      setError("Enter your name, location, and a valid phone number.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (role === "worker" && skills.length === 0) {
      setError("Select at least one skill to create a Worker account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName,
            role,
            phone,
            location,
            skills: role === "worker" ? skills : [],
            experience,
          },
        },
      });
      if (signUpError) throw signUpError;

      if (data.session && data.user) {
        queryClient.setQueryData(["auth", "user"], {
          id: data.user.id,
          email: data.user.email ?? null,
        });
        await queryClient.removeQueries({ queryKey: ["profile", data.user.id] });
        await navigate({ to: dashboardPath });
        return;
      }
      setVerificationEmail(email);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerification = async () => {
    if (!verificationEmail) return;
    setIsResending(true);
    setResendMessage(null);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
        options: { emailRedirectTo: `${window.location.origin}/login?confirmed=1` },
      });
      if (resendError) throw resendError;
      setResendMessage("A new verification email has been sent.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "We couldn't resend the verification email. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="bg-[linear-gradient(150deg,var(--primary),var(--primary-dark))] text-white">
        <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
          {verificationEmail ? (
            <div className="card-surface space-y-5 p-6 text-foreground">
              <h1 className="font-display text-3xl font-extrabold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to <strong>{verificationEmail}</strong>. Verify your
                address to finish creating your Connectly account. The link will take you to your
                {role === "member" ? " Community Member" : " Worker"} dashboard.
              </p>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {resendMessage ? (
                <p role="status" className="text-sm text-primary">
                  {resendMessage}
                </p>
              ) : null}
              <button
                type="button"
                disabled={isResending}
                onClick={resendVerification}
                className="btn-primary w-full"
              >
                {isResending ? "Sending…" : "Resend verification email"}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Already verified?{" "}
                <Link to="/login" className="font-semibold text-primary">
                  Log in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl font-extrabold">Create your account</h1>
              <p className="mt-2 text-sm text-white/80">
                Free to join. It takes about two minutes.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-white/15 p-1">
                <RoleTab active={role === "member"} onClick={() => setRole("member")}>
                  🙋🏽 I need help
                </RoleTab>
                <RoleTab active={role === "worker"} onClick={() => setRole("worker")}>
                  🧰 I want to work
                </RoleTab>
              </div>

              <form className="card-surface mt-6 space-y-5 p-6" onSubmit={handleSubmit}>
                <Field label="Full name">
                  <input
                    className="field"
                    name="fullName"
                    autoComplete="name"
                    placeholder="e.g. Fatima Adams"
                    required
                  />
                </Field>
                <Field label="Email address">
                  <input
                    className="field"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.co.za"
                    required
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    className="field"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="072 123 4567"
                    required
                  />
                </Field>
                <Field label="Password">
                  <input
                    className="field"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </Field>
                <Field label="Location">
                  <input
                    className="field"
                    name="location"
                    defaultValue="Belhar, Cape Town"
                    required
                  />
                </Field>

                {role === "worker" && (
                  <>
                    <Field label="Your skills">
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                          const selected = skills.includes(category);
                          return (
                            <button
                              type="button"
                              key={category}
                              onClick={() => toggleSkill(category)}
                              aria-pressed={selected}
                              className={`pill border ${
                                selected
                                  ? "border-primary bg-accent text-primary"
                                  : "border-border bg-surface text-muted-foreground"
                              }`}
                            >
                              {selected ? "✓ " : "+ "}
                              {category}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <Field label="Experience level">
                      <select className="field" name="experience">
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
                    className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    I agree to the Connectly Terms of Service and Community Guidelines for Belhar
                    members.
                  </span>
                </label>

                {error ? (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <button disabled={isSubmitting} type="submit" className="btn-primary w-full">
                  {isSubmitting
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
            </>
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
        active ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-white"
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
