import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { categories, type Job } from "@/lib/data";
import { useJobDrafts, useJobs } from "@/lib/hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/member/post-job")({
  head: () => ({
    meta: [
      { title: "Post a Job — Connectly" },
      {
        name: "description",
        content: "Describe the job, set your budget in Rand and reach workers near Belhar.",
      },
      { property: "og:title", content: "Post a Job — Connectly" },
      { property: "og:description", content: "Post a job to Belhar workers in two minutes." },
    ],
  }),
  component: PostJob,
});

interface JobFormData {
  title: string;
  category: string;
  description: string;
  budget: string;
  datetime: string;
  location: string;
  urgent: boolean;
}

const INITIAL_FORM_STATE: JobFormData = {
  title: "",
  category: "Gardener",
  description: "",
  budget: "",
  datetime: "",
  location: "Belhar Ext 15, Cape Town",
  urgent: false,
};

function PostJob() {
  const navigate = useNavigate();
  const { saveDraft, getDraft, removeDraft } = useJobDrafts();
  const { addJob } = useJobs();
  const [formData, setFormData] = useState<JobFormData>(() => {
    const draft = getDraft("current-job");
    return draft || INITIAL_FORM_STATE;
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (formData.title.length < 5) newErrors.title = "Job title must be at least 5 characters";

    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters";

    if (!formData.budget || isNaN(Number(formData.budget))) {
      newErrors.budget = "Valid budget is required";
    } else if (Number(formData.budget) < 50) {
      newErrors.budget = "Budget must be at least R50";
    }

    if (!formData.datetime) newErrors.datetime = "Date and time are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name as keyof JobFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSaveDraft = () => {
    saveDraft("current-job", formData);
    toast.success("Job draft saved successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        budget: Number(formData.budget),
        location: formData.location.trim() || "Belhar, Cape Town",
        postedBy: "Fatima Adams",
        clientRating: 5,
        distanceKm: 0,
        when: formData.datetime
          ? new Date(formData.datetime).toLocaleString("en-ZA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date to be confirmed",
        urgent: formData.urgent,
        status: "Open",
        applicants: [],
      };

      addJob(newJob);
      toast.success("Job posted successfully!");
      removeDraft("current-job");
      setFormData(INITIAL_FORM_STATE);
      navigate({ to: "/member/jobs" });
    } catch (error) {
      toast.error("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all form data?")) {
      setFormData(INITIAL_FORM_STATE);
      removeDraft("current-job");
      setErrors({});
    }
  };

  return (
    <AppShell role="member" title="Post a New Job" subtitle="Reach workers within 5 km of you">
      <form
        className="card-surface max-w-2xl space-y-5 p-6"
        onSubmit={handleSubmit}
      >
        <L label="Job title" error={errors.title}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`field ${errors.title ? "border-destructive" : ""}`}
            placeholder="e.g. Garden clean-up and hedge trimming"
          />
        </L>
        <L label="Category">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="field"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </L>
        <L label="Description" error={errors.description}>
          <textarea
            name="description"
            maxLength={200}
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Tell workers exactly what needs doing and what's provided."
            className={`w-full rounded-xl border border-border bg-surface p-4 text-sm outline-none focus:border-primary ${
              errors.description ? "border-destructive" : ""
            }`}
          />
          <span className="mt-1 block text-right text-xs text-muted-foreground">
            {formData.description.length}/200 characters
          </span>
        </L>
        <div className="grid gap-5 sm:grid-cols-2">
          <L label="Budget (R)" error={errors.budget}>
            <input
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              className={`field ${errors.budget ? "border-destructive" : ""}`}
              placeholder="450"
              min="50"
            />
          </L>
          <L label="Date & time needed" error={errors.datetime}>
            <input
              name="datetime"
              type="datetime-local"
              value={formData.datetime}
              onChange={handleChange}
              className={`field ${errors.datetime ? "border-destructive" : ""}`}
            />
          </L>
        </div>
        <L label="Location">
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="field"
          />
        </L>
        <L label="Photos (optional)">
          <div className="grid h-32 place-items-center rounded-xl border-2 border-dashed border-border text-center text-sm text-muted-foreground">
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="photos"
                disabled
              />
              <label htmlFor="photos" className="cursor-pointer">
                📷
                <div>Tap to upload photos of the job</div>
                <div className="text-xs">(Coming soon)</div>
              </label>
            </div>
          </div>
        </L>

        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              urgent: !prev.urgent,
            }))
          }
          className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted"
        >
          <span>
            <span className="block text-sm font-semibold">Mark as urgent</span>
            <span className="block text-xs text-muted-foreground">
              Pushes your job to the top of Find Jobs for 24 hours
            </span>
          </span>
          <span
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              formData.urgent ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-surface transition-all ${
                formData.urgent ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post job"}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary"
          >
            💾 Save draft
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn-ghost"
          >
            🗑️ Clear
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function L({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      {children}
    </label>
  );
}
