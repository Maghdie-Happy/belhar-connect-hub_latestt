import { useCallback, useState, useEffect } from "react";
import { jobs as seedJobs, type Job } from "@/lib/data";

// Payment method types
export type PaymentMethod = {
  id: string;
  type: "card" | "eft" | "wallet";
  name: string;
  details: string;
  isDefault: boolean;
  lastUsed?: string;
};

// User preferences and data
export type UserPreferences = {
  availableForWork: boolean;
  theme: "light" | "dark";
  language: string;
  notifications: {
    newJobMatches: boolean;
    applicationUpdates: boolean;
    messages: boolean;
    weeklyEarningSummary: boolean;
  };
};

// Hooks for managing state

export function useAvailability() {
  const [available, setAvailable] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("workerAvailability");
    return stored === null ? true : stored === "true";
  });

  const toggleAvailability = useCallback(() => {
    setAvailable((prev) => {
      const next = !prev;
      localStorage.setItem("workerAvailability", JSON.stringify(next));
      return next;
    });
  }, []);

  return { available, toggleAvailability };
}

export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("paymentMethods");
    return stored
      ? JSON.parse(stored)
      : [
          {
            id: "pm1",
            type: "card",
            name: "Visa Debit Card",
            details: "**** **** **** 2891",
            isDefault: true,
            lastUsed: "Today",
          },
        ];
  });

  const addPaymentMethod = useCallback(
    (method: PaymentMethod) => {
      const updated = methods.map((item) => ({ ...item, isDefault: false }));
      const newList = [...updated, { ...method, isDefault: true }];
      localStorage.setItem("paymentMethods", JSON.stringify(newList));
      setMethods(newList);
    },
    [methods],
  );

  const removePaymentMethod = useCallback(
    (id: string) => {
      const removedDefault = methods.some((method) => method.id === id && method.isDefault);
      let newList = methods.filter((method) => method.id !== id);
      if (removedDefault && newList.length > 0) {
        newList = newList.map((method, index) => ({ ...method, isDefault: index === 0 }));
      }
      if (newList.length === 0) {
        localStorage.removeItem("paymentMethods");
      } else {
        localStorage.setItem("paymentMethods", JSON.stringify(newList));
      }
      setMethods(newList);
    },
    [methods],
  );

  const setDefault = useCallback(
    (id: string) => {
      const updated = methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }));
      localStorage.setItem("paymentMethods", JSON.stringify(updated));
      setMethods(updated);
    },
    [methods],
  );

  return { methods, addPaymentMethod, removePaymentMethod, setDefault };
}

export function useJobs() {
  const [items, setItems] = useState<Job[]>(() => {
    if (typeof window === "undefined") return seedJobs;
    const stored = localStorage.getItem("connectlyJobs");
    return stored ? JSON.parse(stored) : seedJobs;
  });

  const addJob = useCallback((job: Job) => {
    setItems((prev) => {
      const next = [job, ...prev];
      localStorage.setItem("connectlyJobs", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setItems((prev) => {
      const next = prev.map((job) => (job.id === id ? { ...job, ...updates } : job));
      localStorage.setItem("connectlyJobs", JSON.stringify(next));
      return next;
    });
  }, []);

  return { jobs: items, addJob, updateJob };
}

export function useSavedJobs() {
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("savedJobs");
    return stored ? JSON.parse(stored) : [];
  });

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("savedJobs", JSON.stringify(next));
      return next;
    });
  }, []);

  return { saved, toggleSaved };
}

export function useApplications() {
  const [applied, setApplied] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("workerApplications");
    return stored ? JSON.parse(stored) : [];
  });

  const applyToJob = useCallback((id: string) => {
    setApplied((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("workerApplications", JSON.stringify(next));
      return next;
    });
  }, []);

  return { applied, applyToJob };
}

export function useJobDrafts() {
  const [drafts, setDrafts] = useState<Record<string, any>>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("jobDrafts");
    return stored ? JSON.parse(stored) : {};
  });

  const saveDraft = useCallback((id: string, data: any) => {
    setDrafts((prev) => {
      const updated = { ...prev, [id]: { ...data, savedAt: new Date().toISOString() } };
      localStorage.setItem("jobDrafts", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => {
      const { [id]: _, ...rest } = prev;
      localStorage.setItem("jobDrafts", JSON.stringify(rest));
      return rest;
    });
  }, []);

  const getDraft = useCallback((id: string) => drafts[id], [drafts]);

  return { drafts, saveDraft, removeDraft, getDraft };
}

export function useJobStatus() {
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("jobStatuses");
    return stored ? JSON.parse(stored) : {};
  });

  const updateStatus = useCallback((jobId: string, status: string) => {
    setJobStatuses((prev) => {
      const updated = { ...prev, [jobId]: status };
      localStorage.setItem("jobStatuses", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { jobStatuses, updateStatus };
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === "undefined")
      return {
        availableForWork: true,
        theme: "light",
        language: "English",
        notifications: {
          newJobMatches: true,
          applicationUpdates: true,
          messages: true,
          weeklyEarningSummary: false,
        },
      };
    const stored = localStorage.getItem("userPreferences");
    return stored
      ? JSON.parse(stored)
      : {
          availableForWork: true,
          theme: "light",
          language: "English",
          notifications: {
            newJobMatches: true,
            applicationUpdates: true,
            messages: true,
            weeklyEarningSummary: false,
          },
        };
  });

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("userPreferences", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { preferences, updatePreferences };
}
