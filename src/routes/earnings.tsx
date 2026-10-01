import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/ui-kit";
import { usePaymentMethods } from "@/lib/hooks";
import {
  formatCurrency,
  readWorkerWallet,
  withdrawWorkerEarnings,
  type WorkerWallet,
} from "@/lib/worker-wallet";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — Connectly" },
      {
        name: "description",
        content: "Track what you've earned this week, view transactions and withdraw on Connectly.",
      },
      { property: "og:title", content: "Earnings — Connectly" },
      { property: "og:description", content: "Your Connectly income in Rand." },
    ],
  }),
  component: Earnings,
});

function Earnings() {
  const [wallet, setWallet] = useState<WorkerWallet>(() => readWorkerWallet());
  const [amount, setAmount] = useState(() => String(wallet.availableToWithdraw));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { methods } = usePaymentMethods();
  const cardMethods = methods.filter((method) => method.type === "card");
  const defaultMethod = cardMethods.find((method) => method.isDefault) ?? cardMethods[0];
  const [selectedMethodId, setSelectedMethodId] = useState(() => defaultMethod?.id ?? "");
  const payoutMethod =
    cardMethods.find((method) => method.id === selectedMethodId) ?? defaultMethod;

  const weeklyValues = useMemo(
    () => [
      { day: "Mon", amount: 450 },
      { day: "Tue", amount: 0 },
      { day: "Wed", amount: 700 },
      { day: "Thu", amount: 380 },
      { day: "Fri", amount: 1200 },
      { day: "Sat", amount: 900 },
      { day: "Sun", amount: 0 },
    ],
    [],
  );
  const max = Math.max(...weeklyValues.map((day) => day.amount));
  const weekTotal = weeklyValues.reduce((sum, day) => sum + day.amount, 0);

  const handleWithdraw = () => {
    setError(null);
    setSuccess(null);
    if (!payoutMethod) {
      setError("Add a card in Settings before requesting a payout.");
      return;
    }

    const numericAmount = Number(amount);
    try {
      const nextWallet = withdrawWorkerEarnings(numericAmount, payoutMethod);
      setWallet(nextWallet);
      setAmount(String(nextWallet.availableToWithdraw));
      setSuccess(
        `${formatCurrency(numericAmount)} was recorded as a payout to ${payoutMethod.name} (${payoutMethod.details}).`,
      );
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : "Withdrawal failed.");
    }
  };

  const handleWithdrawAll = () => {
    setAmount(String(wallet.availableToWithdraw));
    setError(null);
    setSuccess(null);
  };

  return (
    <AppShell
      role="worker"
      title="Earnings"
      subtitle="Track your Connectly earnings and payout balance"
      action={
        <button className="btn-primary" onClick={handleWithdraw} type="button">
          Withdraw to card
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total earned"
          value={formatCurrency(wallet.totalEarned)}
          hint="Since March 2026"
          icon="💰"
        />
        <StatCard label="This week" value={formatCurrency(weekTotal)} hint="6 jobs" icon="📈" />
        <StatCard
          label="Available to withdraw"
          value={formatCurrency(wallet.availableToWithdraw)}
          hint="Cleared funds"
          icon="🏦"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">This week</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklyValues.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {day.amount ? formatCurrency(day.amount) : ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-[linear-gradient(180deg,var(--primary),var(--primary-dark))]"
                  style={{ height: `${max ? (day.amount / max) * 100 : 0}%`, minHeight: 4 }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Payout card</h2>
            {payoutMethod ? (
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
                {payoutMethod.isDefault ? "Default" : "Saved"}
              </span>
            ) : null}
          </div>
          {payoutMethod ? (
            <>
              <div className="rounded-2xl bg-[linear-gradient(135deg,#1f4e39,#2d6a4f)] p-4 text-white shadow-lg">
                <div className="text-xs uppercase tracking-[0.2em] text-emerald-100">
                  Connectly payout
                </div>
                <div className="mt-6 text-2xl font-display font-bold">
                  {formatCurrency(wallet.cardBalance)}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 text-sm text-emerald-100">
                  <span className="truncate">{payoutMethod.name}</span>
                  <span>{payoutMethod.details.slice(-4)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Payouts are recorded in this demo wallet. Live transfers require a connected payout
                provider.
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              Add a debit or credit card to choose a payout destination.
            </div>
          )}
          <Link to="/settings" className="btn-secondary mt-4 w-full !h-10 !px-4 !text-sm">
            Manage payment methods
          </Link>

          {cardMethods.length > 1 ? (
            <label htmlFor="payout-method" className="mt-5 block text-sm font-medium">
              Choose a payout card
              <select
                id="payout-method"
                value={payoutMethod?.id ?? ""}
                onChange={(event) => setSelectedMethodId(event.target.value)}
                className="field mt-2"
              >
                {cardMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} · {method.details.slice(-4)}
                    {method.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : payoutMethod ? (
            <p className="mt-5 text-sm font-medium">
              Payout card: {payoutMethod.name} · {payoutMethod.details.slice(-4)}
            </p>
          ) : null}

          <label
            htmlFor="withdrawal-amount"
            className="mt-5 block text-sm font-medium text-muted-foreground"
          >
            Withdrawal amount (ZAR)
          </label>
          <input
            id="withdrawal-amount"
            type="number"
            min="0.01"
            max={wallet.availableToWithdraw}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="field mt-2"
            placeholder="R0.00"
          />
          <button
            type="button"
            onClick={handleWithdrawAll}
            disabled={wallet.availableToWithdraw <= 0}
            className="mt-2 text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use full available balance
          </button>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="mt-3 text-sm text-primary">
              {success}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Available:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(wallet.availableToWithdraw)}
              </span>
            </p>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={!payoutMethod || wallet.availableToWithdraw <= 0}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Withdraw {amount ? formatCurrency(Number(amount)) : "amount"}
            </button>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <h2 className="border-b border-border p-5 font-display text-lg font-bold">Transactions</h2>
        <ul className="divide-y divide-border">
          {wallet.transactions.map((transaction) => (
            <li key={transaction.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-4">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{transaction.description}</span>
                <span className="block text-xs text-muted-foreground">
                  {transaction.type === "withdrawal" ? "Withdrawal" : "Payment"} ·{" "}
                  {new Date(transaction.date).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              <span
                className={`shrink-0 font-display font-bold ${
                  transaction.type === "withdrawal" ? "text-muted-foreground" : "text-primary"
                }`}
              >
                {transaction.type === "withdrawal" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
