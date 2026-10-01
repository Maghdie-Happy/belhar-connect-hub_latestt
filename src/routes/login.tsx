import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/MarketingLayout";
import { supabase } from "@/integrations/supabase/client";
import { isProtectedRoute, type ProtectedRoute } from "@/lib/protected-routes";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { confirmed?: true; reset?: true; next?: ProtectedRoute } => {
    const next = isProtectedRoute(search["next"]) ? search["next"] : undefined;
    return {
      ...(search["confirmed"] === "1" ? { confirmed: true as const } : {}),
      ...(search["reset"] === "1" ? { reset: true as const } : {}),
      ...(next ? { next } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Log in — Connectly" },
      {
        name: "description",
        content:
          "Log in to Connectly to manage your jobs, applications and messages in Belhar, Cape Town.",
      },
      { property: "og:title", content: "Log in to Connectly" },
      { property: "og:description", content: "Access your Connectly dashboard." },
    ],
  }),
  component: Login,
});

type Mode = "login" | "forgot" | "reset";

function Login() {
  const { confirmed, reset, next } = Route.useSearch();
  const [role, setRole] = useState<"member" | "worker">("member");
  const [mode, setMode] = useState<Mode>(reset ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    confirmed ? "Email confirmed. You can now log in to Connectly." : null,
  );
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
      if (!data.user) throw new Error("Sign-in did not return a user. Please try again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const profileRole = profile?.role ?? data.user.user_metadata["role"];
      if (profileRole !== role) {
        await supabase.auth.signOut();
        throw new Error(
          `This account is registered as a ${profileRole === "worker" ? "Worker" : "Community Member"}. Choose that option to log in.`,
        );
      }
      const roleHome = role === "worker" ? "/worker/dashboard" : "/member/dashboard";
      const nextMatchesRole = next ? next.startsWith("/worker/") || next === "/earnings" : false;
      const destination = next && nextMatchesRole === (role === "worker") ? next : roleHome;
      toast.success("Welcome back to Connectly.");
      navigate({ to: destination });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Could not log in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });
      if (resetError) throw resetError;
      setNotice("If an account exists for that email, a password reset link has been sent.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send a reset email.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setPassword("");
      setConfirmPassword("");
      setMode("login");
      setNotice("Your password has been changed. Log in with your new password.");
      toast.success("Password changed.");
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : "Could not update your password.",
      );
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "forgot"
      ? "Reset your password"
      : mode === "reset"
        ? "Choose a new password"
        : "Welcome back";

  return (
    <MarketingLayout>
      <section className="flex flex-1 flex-col bg-[linear-gradient(150deg,var(--primary),var(--primary-dark))] text-white">
        <div className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-white/80">
            {mode === "forgot"
              ? "We’ll email you a secure link to reset your password."
              : mode === "reset"
                ? "Choose a new password for your Connectly account."
                : "Log in to continue on Connectly."}
          </p>

          {mode === "login" ? (
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-white/15 p-1">
              {(["member", "worker"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={role === option}
                  onClick={() => setRole(option)}
                  className={`h-11 rounded-lg text-sm font-semibold transition-colors ${
                    role === option
                      ? "bg-surface text-primary shadow-[var(--shadow-card)]"
                      : "text-white/85 hover:text-white"
                  }`}
                >
                  {option === "member" ? "Community Member" : "Worker"}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="card-surface mt-6 space-y-5 p-6 text-foreground"
            onSubmit={
              mode === "forgot"
                ? handleForgotPassword
                : mode === "reset"
                  ? handlePasswordReset
                  : handleLogin
            }
          >
            {mode !== "reset" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Email address</span>
                <input
                  required
                  autoComplete="email"
                  className="field"
                  type="email"
                  placeholder="you@example.co.za"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            ) : null}

            {mode === "login" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Password</span>
                  <input
                    required
                    autoComplete="current-password"
                    className="field"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <div className="text-right text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setNotice(null);
                    }}
                    className="font-semibold text-primary"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : null}

            {mode === "reset" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">New password</span>
                  <input
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="field"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Confirm new password</span>
                  <input
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="field"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </label>
              </>
            ) : null}

            {notice ? (
              <p role="status" className="rounded-lg bg-accent p-3 text-sm text-primary">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button
              disabled={busy}
              type="submit"
              className="btn-primary w-full disabled:cursor-wait disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "forgot"
                  ? "Send reset link"
                  : mode === "reset"
                    ? "Update password"
                    : `Log in as ${role === "member" ? "Community Member" : "Worker"}`}
            </button>

            {mode !== "login" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setNotice(null);
                }}
                className="btn-secondary w-full"
              >
                Back to log in
              </button>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                New to Connectly?{" "}
                <Link to="/signup" className="font-semibold text-primary">
                  Create an account
                </Link>
              </p>
            )}
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
