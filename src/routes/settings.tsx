import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { usePaymentMethods, useUserPreferences, type UserPreferences } from "@/lib/hooks";
import { useProfile, useSignOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Connectly" },
      {
        name: "description",
        content: "Manage your Connectly account, notifications, language and appearance.",
      },
      { property: "og:title", content: "Settings — Connectly" },
      { property: "og:description", content: "Account and notification preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { profile, email } = useProfile();
  const signOut = useSignOut();
  const { preferences, updatePreferences } = useUserPreferences();
  const { methods, addPaymentMethod, removePaymentMethod, setDefault } = usePaymentMethods();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    cardName: "",
    cardNumber: "",
    cvv: "",
    expiry: "",
  });
  const [paymentFormError, setPaymentFormError] = useState<string | null>(null);
  const [paymentFormSuccess, setPaymentFormSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [password, setPassword] = useState({ next: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", preferences.theme === "dark");
  }, [preferences.theme]);

  const flip = (notifKey: keyof typeof preferences.notifications) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [notifKey]: !preferences.notifications[notifKey],
      },
    });
  };

  const handleToggleDarkMode = () => {
    updatePreferences({ theme: preferences.theme === "light" ? "dark" : "light" });
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    if (password.next.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password.next !== password.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.next });
      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPassword({ next: "", confirm: "" });
      setShowPasswordChange(false);
      toast.success("Password changed successfully.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentFormError(null);
    setPaymentFormSuccess(null);

    if (!newPayment.cardName.trim()) {
      setPaymentFormError("Card name is required.");
      return;
    }
    if (!isValidCardNumber(newPayment.cardNumber)) {
      setPaymentFormError("Enter a valid card number.");
      return;
    }
    const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(newPayment.expiry);
    if (!expiryMatch) {
      setPaymentFormError("Enter the expiry date in MM/YY format.");
      return;
    }
    const expiryYear = 2000 + Number(expiryMatch[2]);
    const expiryMonth = Number(expiryMatch[1]);
    const now = new Date();
    if (
      expiryYear < now.getFullYear() ||
      (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)
    ) {
      setPaymentFormError("This card has expired.");
      return;
    }
    const expectedCvvLength =
      newPayment.cardNumber.startsWith("34") || newPayment.cardNumber.startsWith("37") ? 4 : 3;
    if (!new RegExp(`^\\d{${expectedCvvLength}}$`).test(newPayment.cvv)) {
      setPaymentFormError(`Enter a ${expectedCvvLength}-digit security code.`);
      return;
    }

    const cardBrand = getCardBrand(newPayment.cardNumber);
    const newMethod = {
      id: `pm${Date.now()}`,
      type: "card" as const,
      name: newPayment.cardName.trim() || `${cardBrand} card`,
      details: `**** **** **** ${newPayment.cardNumber.slice(-4)}`,
      isDefault: methods.length === 0,
      lastUsed: "Just now",
    };

    try {
      addPaymentMethod(newMethod);
    } catch (error) {
      setPaymentFormError(
        error instanceof Error
          ? `Could not save this card: ${error.message}`
          : "Could not save this card. Please try again.",
      );
      return;
    }

    setNewPayment({ cardName: "", cardNumber: "", cvv: "", expiry: "" });
    setShowAddPayment(false);
    setPaymentFormSuccess(`${cardBrand} ending in ${newMethod.details.slice(-4)} added.`);
  };

  const cancelAddPayment = () => {
    setNewPayment({ cardName: "", cardNumber: "", cvv: "", expiry: "" });
    setPaymentFormError(null);
    setShowAddPayment(false);
  };

  const handleRemovePayment = (id: string) => {
    removePaymentMethod(id);
    setShowDeleteConfirm(null);
    toast.success("Payment method removed");
  };

  const notificationToggles: { key: keyof UserPreferences["notifications"]; label: string }[] = [
    { key: "newJobMatches", label: "New job matches" },
    { key: "applicationUpdates", label: "Application updates" },
    { key: "messages", label: "Messages" },
    { key: "weeklyEarningSummary", label: "Weekly earnings summary" },
  ];

  return (
    <AppShell
      role={profile?.role === "worker" ? "worker" : "member"}
      title="Settings"
      subtitle="Account, notifications and appearance"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Account</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profile?.full_name || "Not set"} />
            <Row label="Email" value={email || "Not set"} />
            <Row label="Phone" value={profile?.phone || "Not set"} />
            <Row label="Location" value={profile?.location || "Not set"} />
          </div>
          <div className="mt-5 space-y-2">
            <Link
              to="/profile"
              search={{ edit: true }}
              className="btn-secondary w-full"
              title="Edit your profile information"
            >
              Edit profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setPasswordError(null);
                setShowPasswordChange(true);
              }}
              className="btn-secondary w-full"
              title="Change your account password"
            >
              Change password
            </button>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Preferences</h2>
          <div className="mt-4 space-y-1">
            {notificationToggles.map((item) => (
              <button
                key={item.key}
                onClick={() => flip(item.key)}
                aria-pressed={preferences.notifications[item.key]}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-3 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{item.label}</span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    preferences.notifications[item.key] ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                      preferences.notifications[item.key] ? "left-6" : "left-1"
                    }`}
                  />
                </span>
              </button>
            ))}
            <button
              onClick={handleToggleDarkMode}
              aria-pressed={preferences.theme === "dark"}
              className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-3 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium">Dark mode</span>
              <span
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  preferences.theme === "dark" ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                    preferences.theme === "dark" ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold">Language</span>
            <select
              value={preferences.language}
              onChange={(e) => updatePreferences({ language: e.target.value })}
              className="field"
            >
              <option>English</option>
              <option>Afrikaans</option>
              <option>isiXhosa</option>
            </select>
          </label>
        </div>

        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold">Payment Methods</h2>
            <button
              onClick={() => setShowAddPayment(!showAddPayment)}
              className="btn-primary !h-10 !px-4 !text-sm"
              title="Add a new payment method"
            >
              + Add Payment Method
            </button>
          </div>
          {showAddPayment && (
            <form
              onSubmit={handleAddPayment}
              className="mt-4 space-y-3 rounded-lg border border-border p-4"
            >
              <label>
                <span className="mb-1 block text-sm font-semibold">Card name</span>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  value={newPayment.cardName}
                  onChange={(e) => setNewPayment({ ...newPayment, cardName: e.target.value })}
                  className="field"
                  placeholder="Name on card"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-semibold">Card number</span>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={23}
                    value={newPayment.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        cardNumber: e.target.value.replace(/\D/g, "").slice(0, 19),
                      })
                    }
                    className="field"
                    placeholder="0000 0000 0000 0000"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Expiry date</span>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={5}
                    value={newPayment.expiry}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setNewPayment({
                        ...newPayment,
                        expiry:
                          digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
                      });
                    }}
                    className="field"
                    placeholder="MM/YY"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">CVV</span>
                  <input
                    required
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    value={newPayment.cvv}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    className="field"
                    placeholder="123"
                  />
                </label>
              </div>
              {paymentFormError ? (
                <p role="alert" className="text-sm text-destructive">
                  {paymentFormError}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Add Card
                </button>
                <button type="button" onClick={cancelAddPayment} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {paymentFormSuccess ? (
            <p role="status" className="mt-4 text-sm text-primary">
              {paymentFormSuccess}
            </p>
          ) : null}

          <div className="mt-4 space-y-2">
            {methods.length > 0 ? (
              methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="font-semibold">
                      {method.name}{" "}
                      {method.isDefault && <span className="text-xs text-primary">(Default)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {method.details} · Last used: {method.lastUsed}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefault(method.id)}
                        className="btn-ghost !h-9 !text-xs"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(method.id)}
                      className="btn-ghost !h-9 !text-xs !text-destructive"
                    >
                      Delete
                    </button>
                  </div>

                  {showDeleteConfirm === method.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="card-surface max-w-sm space-y-4 p-6">
                        <h3 className="font-display text-lg font-bold">Remove Payment Method?</h3>
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to remove {method.name}? This action cannot be
                          undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRemovePayment(method.id)}
                            className="btn-primary flex-1 !text-destructive"
                          >
                            Yes, remove
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment methods yet. Add one to get started.
              </p>
            )}
          </div>
        </div>

        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Support</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Link
              to="/help"
              className="btn-secondary w-full"
              title="Visit the Connectly help centre"
            >
              Help centre
            </Link>
            <Link
              to="/support/report"
              className="btn-secondary w-full"
              title="Send a problem report to Connectly support"
            >
              Report a problem
            </Link>
            <Link
              to="/community-guidelines"
              className="btn-secondary w-full"
              title="Read Connectly community guidelines"
            >
              Community guidelines
            </Link>
          </div>
          <button onClick={signOut} className="btn-ghost mt-4 w-full !text-destructive">
            Log out
          </button>
        </div>
      </div>
      {showPasswordChange ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handlePasswordChange}
            className="card-surface w-full max-w-md space-y-4 p-6"
          >
            <h2 className="font-display text-lg font-bold">Change password</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">New password</span>
              <input
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={(event) => setPassword({ ...password, next: event.target.value })}
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
            {passwordError ? (
              <p role="alert" className="text-sm text-destructive">
                {passwordError}
              </p>
            ) : null}
            <div className="flex gap-3">
              <button disabled={savingPassword} type="submit" className="btn-primary flex-1">
                {savingPassword ? "Updating…" : "Update password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPassword({ next: "", confirm: "" });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

function isValidCardNumber(number: string) {
  if (!/^\d{13,19}$/.test(number)) return false;

  let sum = 0;
  let doubleDigit = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function getCardBrand(number: string) {
  if (number.startsWith("4")) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "American Express";
  if (/^6(?:011|5)/.test(number)) return "Discover";
  return "Payment";
}
