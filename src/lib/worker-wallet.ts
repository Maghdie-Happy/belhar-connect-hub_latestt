export type WorkerWalletTransaction = {
  id: string;
  type: "payment" | "withdrawal";
  amount: number;
  date: string;
  description: string;
};

export type WorkerWallet = {
  totalEarned: number;
  availableToWithdraw: number;
  cardBalance: number;
  cardHolder: string;
  cardBrand: string;
  cardLast4: string;
  transactions: WorkerWalletTransaction[];
};

const STORAGE_KEY = "connectly-worker-wallet";

export const defaultWorkerWallet: WorkerWallet = {
  totalEarned: 23850,
  availableToWithdraw: 2730,
  cardBalance: 1250,
  cardHolder: "Sipho Mthembu",
  cardBrand: "Visa",
  cardLast4: "4242",
  transactions: [
    {
      id: "tx-1",
      type: "payment",
      amount: 1200,
      date: "2026-08-01",
      description: "Install outside plug points",
    },
    {
      id: "tx-2",
      type: "payment",
      amount: 450,
      date: "2026-07-28",
      description: "Hedge trimming & lawn",
    },
    {
      id: "tx-3",
      type: "payment",
      amount: 700,
      date: "2026-07-25",
      description: "Deep clean 2-bedroom flat",
    },
  ],
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function readWorkerWallet(): WorkerWallet {
  if (typeof window === "undefined") {
    return defaultWorkerWallet;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkerWallet));
      return defaultWorkerWallet;
    }

    const parsed = JSON.parse(raw) as Partial<WorkerWallet>;
    return {
      ...defaultWorkerWallet,
      ...parsed,
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : defaultWorkerWallet.transactions,
    };
  } catch {
    return defaultWorkerWallet;
  }
}

export function writeWorkerWallet(wallet: WorkerWallet) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  }
  return wallet;
}

export function withdrawWorkerEarnings(
  amount: number,
  payoutMethod: { name: string; details: string },
): WorkerWallet {
  const current = readWorkerWallet();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid withdrawal amount.");
  }

  if (amount > current.availableToWithdraw) {
    throw new Error("You cannot withdraw more than the amount available to withdraw.");
  }

  const cardLast4 = payoutMethod.details.replace(/\D/g, "").slice(-4);
  if (!cardLast4) {
    throw new Error("The selected payout card does not have a valid card number.");
  }

  const cardBrand = /mastercard/i.test(payoutMethod.name)
    ? "Mastercard"
    : /amex|american express/i.test(payoutMethod.name)
      ? "American Express"
      : /visa/i.test(payoutMethod.name)
        ? "Visa"
        : "Card";

  const nextWallet: WorkerWallet = {
    ...current,
    availableToWithdraw: Number((current.availableToWithdraw - amount).toFixed(2)),
    cardBalance: Number((current.cardBalance + amount).toFixed(2)),
    cardHolder: payoutMethod.name,
    cardBrand,
    cardLast4,
    transactions: [
      {
        id: `withdraw-${Date.now()}`,
        type: "withdrawal" as const,
        amount,
        date: new Date().toISOString(),
        description: `Payout recorded to ${cardBrand} ending ${cardLast4}`,
      },
      ...current.transactions,
    ].slice(0, 8),
  };

  return writeWorkerWallet(nextWallet);
}
