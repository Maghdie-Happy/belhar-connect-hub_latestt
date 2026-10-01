import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Stars, Tag } from "@/components/ui-kit";
import { reviews } from "@/lib/data";
import { initials, useProfile, useSignOut, type Profile as ProfileRow } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  validateSearch: (search: Record<string, unknown>): { edit?: true } =>
    search["edit"] === true || search["edit"] === "true" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "My Profile — Connectly" },
      {
        name: "description",
        content: "Your Connectly profile: skills, rating, reviews and account settings.",
      },
      { property: "og:title", content: "My Profile — Connectly" },
      { property: "og:description", content: "Manage your Connectly profile and reviews." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const signOut = useSignOut();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, email, profile, isLoading } = useProfile();
  const { edit } = Route.useSearch();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", about: "" });
  const [password, setPassword] = useState({ new: "", confirm: "" });

  useEffect(() => {
    if (edit) {
      setShowEditProfile(true);
      navigate({ to: "/profile", search: {}, replace: true });
    }
  }, [edit, navigate]);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.full_name,
        email: email ?? "",
        phone: profile.phone ?? "",
        about: profile.bio ?? "",
      });
    }
  }, [email, profile]);

  const openEditProfile = () => {
    setProfileSaveMessage(null);
    setProfileSaveError(null);
    setEditData({
      name: profile?.full_name ?? "",
      email: email ?? "",
      phone: profile?.phone ?? "",
      about: profile?.bio ?? "",
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      setProfileSaveError("Sign in again to update your profile.");
      return;
    }
    if (!editData.name.trim()) {
      setProfileSaveError("Name is required.");
      return;
    }
    if (editData.about.trim() && editData.about.trim().length < 10) {
      setProfileSaveError("About section must be at least 10 characters.");
      return;
    }
    if (!/^\+?[0-9\s()-]{7,20}$/.test(editData.phone.trim())) {
      setProfileSaveError("Enter a valid phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email.trim())) {
      setProfileSaveError("Enter a valid email address.");
      return;
    }

    setProfileSaveError(null);
    setProfileSaveMessage(null);
    setSavingProfile(true);
    try {
      const changes = {
        full_name: editData.name.trim(),
        phone: editData.phone.trim(),
        bio: editData.about.trim(),
      };
      const { data: savedProfile, error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...changes }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;

      queryClient.setQueryData<ProfileRow | null>(["profile", userId], savedProfile);

      let confirmationRequired = false;
      if (editData.email.trim().toLowerCase() !== email?.toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editData.email.trim(),
        });
        if (emailError) {
          setProfileSaveError(
            `Your name, phone and bio were saved, but the email was not changed: ${emailError.message}`,
          );
        } else {
          confirmationRequired = true;
        }
      }

      const message = confirmationRequired
        ? "Profile saved. Confirm the email change using the link sent to your new address."
        : "Profile changes saved successfully.";
      setShowEditProfile(false);
      setProfileSaveMessage(null);
      toast.success(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save profile details.";
      setProfileSaveError(message);
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.new.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password.new !== password.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.new });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password changed successfully.");
      setPassword({ new: "", confirm: "" });
      setShowPasswordChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const fullName = profile?.full_name || "Your profile";

  return (
    <AppShell
      role={profile?.role === "worker" ? "worker" : "member"}
      title="My Profile"
      subtitle="How the community sees you"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-primary">
                {initials(fullName)}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold">
                  {isLoading ? "Loading profile…" : fullName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile?.skills?.join(" · ") || "Connectly worker"}
                  {profile?.location ? ` · ${profile.location}` : ""}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <Stars rating={profile?.rating ?? 0} />
                  <span className="text-muted-foreground">
                    {profile?.jobs_done ?? 0} jobs completed
                  </span>
                </div>
              </div>
            </div>
            {profile?.skills?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Tag key={skill} label={skill} className="bg-accent text-primary" />
                ))}
              </div>
            ) : null}
            <h3 className="mt-6 font-display font-bold">About me</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {profile?.bio || "Add a short introduction so nearby clients can get to know you."}
            </p>
            <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">Email:</span> {email || "Not set"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {profile?.phone || "Not set"}
              </p>
            </div>
          </div>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.name} className="card-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{review.name}</span>
                    <span className="text-secondary">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">"{review.text}"</p>
                  <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="card-surface h-fit p-5">
          <h3 className="font-display font-bold">Settings</h3>
          <div className="mt-4 space-y-2">
            <button
              onClick={openEditProfile}
              className="btn-secondary w-full"
              title="Edit your profile information"
            >
              Edit profile
            </button>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="btn-secondary w-full"
              title="Change your password"
            >
              Change password
            </button>
            <Link to="/notifications" className="btn-ghost w-full">
              Notifications
            </Link>
            <Link to="/settings" className="btn-ghost w-full">
              Language & settings
            </Link>
            <button onClick={signOut} className="btn-ghost w-full !text-destructive">
              Log out
            </button>
          </div>
        </aside>

        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <form
              onSubmit={handleSaveProfile}
              className="card-surface max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto p-6"
            >
              <h3 className="font-display text-lg font-bold">Edit profile</h3>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Full name</span>
                <input
                  required
                  autoComplete="name"
                  value={editData.name}
                  onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                  className="field"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={editData.email}
                  onChange={(event) => setEditData({ ...editData, email: event.target.value })}
                  className="field"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  A confirmation link will be sent when you change your email.
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Phone number</span>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={editData.phone}
                  onChange={(event) => setEditData({ ...editData, phone: event.target.value })}
                  className="field"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">About</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={editData.about}
                  onChange={(event) => setEditData({ ...editData, about: event.target.value })}
                  className="field"
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {editData.about.length}/500
                </span>
              </label>
              {profileSaveError ? (
                <p role="alert" className="text-sm text-destructive">
                  {profileSaveError}
                </p>
              ) : null}
              {profileSaveMessage ? (
                <p role="status" className="text-sm text-primary">
                  {profileSaveMessage}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button disabled={savingProfile} type="submit" className="btn-primary flex-1">
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showPasswordChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form
              onSubmit={handleChangePassword}
              className="card-surface w-full max-w-md space-y-4 p-6"
            >
              <h3 className="font-display text-lg font-bold">Change password</h3>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">New password</span>
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={password.new}
                  onChange={(event) => setPassword({ ...password, new: event.target.value })}
                  className="field"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Confirm new password</span>
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={password.confirm}
                  onChange={(event) => setPassword({ ...password, confirm: event.target.value })}
                  className="field"
                />
              </label>
              <div className="flex gap-3">
                <button disabled={savingPassword} type="submit" className="btn-primary flex-1">
                  {savingPassword ? "Updating…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPassword({ new: "", confirm: "" });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
