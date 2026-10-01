import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type JobRow = Tables<"jobs">;
export type ProfileRow = Tables<"profiles">;

export type PosterLite = Pick<ProfileRow, "id" | "full_name" | "rating" | "location">;

export type JobWithPoster = JobRow & {
  poster: PosterLite | null;
  applications?: { count: number }[];
};

const JOB_SELECT =
  "*, poster:profiles!jobs_poster_id_fkey(id, full_name, rating, location), applications(count)";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function applicantCount(job: JobWithPoster) {
  return job.applications?.[0]?.count ?? 0;
}

/* ---------------- jobs ---------------- */

export const openJobsQuery = queryOptions({
  queryKey: ["jobs", "open"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("jobs")
        .select(JOB_SELECT)
        .eq("status", "Open")
        .order("urgent", { ascending: false })
        .order("created_at", { ascending: false }),
    ) as JobWithPoster[],
});

export const myJobsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["jobs", "mine", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("jobs")
          .select(JOB_SELECT)
          .eq("poster_id", userId!)
          .order("created_at", { ascending: false }),
      ) as JobWithPoster[],
  });

export type ApplicantRow = Tables<"applications"> & {
  worker: (ProfileRow & { id: string }) | null;
};

export const jobQuery = (jobId: string) =>
  queryOptions({
    queryKey: ["job", jobId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("jobs")
          .select(
            "*, poster:profiles!jobs_poster_id_fkey(id, full_name, rating, location), applications(*, worker:profiles!applications_worker_id_fkey(*))",
          )
          .eq("id", jobId)
          .maybeSingle(),
      ) as (JobWithPoster & { applications: ApplicantRow[] }) | null,
  });

export type MyApplication = Tables<"applications"> & {
  job: (JobRow & { poster: PosterLite | null }) | null;
};

export const myApplicationsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["applications", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("applications")
          .select("*, job:jobs(*, poster:profiles!jobs_poster_id_fkey(id, full_name, rating, location))")
          .eq("worker_id", userId!)
          .order("created_at", { ascending: false }),
      ) as MyApplication[],
  });

/* ---------------- messaging ---------------- */

export type ConversationRow = Tables<"conversations"> & {
  member: PosterLite | null;
  worker: PosterLite | null;
};

export const conversationsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("conversations")
          .select(
            "*, member:profiles!conversations_member_id_fkey(id, full_name, rating, location), worker:profiles!conversations_worker_id_fkey(id, full_name, rating, location)",
          )
          .order("last_message_at", { ascending: false }),
      ) as ConversationRow[],
  });

export const conversationQuery = (id: string) =>
  queryOptions({
    queryKey: ["conversation", id],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("conversations")
          .select(
            "*, member:profiles!conversations_member_id_fkey(id, full_name, rating, location), worker:profiles!conversations_worker_id_fkey(id, full_name, rating, location)",
          )
          .eq("id", id)
          .maybeSingle(),
      ) as ConversationRow | null,
  });

export const messagesQuery = (conversationId: string) =>
  queryOptions({
    queryKey: ["messages", conversationId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ) as Tables<"messages">[],
  });

export async function startConversation(opts: {
  memberId: string;
  workerId: string;
  jobId?: string | null;
}) {
  const existing = await supabase
    .from("conversations")
    .select("id")
    .eq("member_id", opts.memberId)
    .eq("worker_id", opts.workerId)
    .limit(1)
    .maybeSingle();
  if (existing.data) return existing.data.id;

  const created = unwrap<{ id: string }>(
    await supabase
      .from("conversations")
      .insert({ member_id: opts.memberId, worker_id: opts.workerId, job_id: opts.jobId ?? null })
      .select("id")
      .single(),
  );
  return created.id;
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  unwrap(
    await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, body })
      .select("id")
      .single(),
  );
  await supabase
    .from("conversations")
    .update({ last_message: body, last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

/* ---------------- notifications, payments, reviews ---------------- */

export const notificationsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false }),
      ) as Tables<"notifications">[],
  });

export async function notify(userId: string, title: string, body: string, icon = "🔔") {
  await supabase.from("notifications").insert({ user_id: userId, title, body, icon });
}

export const paymentsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["payments", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase.from("payments").select("*").order("paid_at", { ascending: false }),
      ) as Tables<"payments">[],
  });

export type ReviewRow = Tables<"reviews"> & { reviewer: PosterLite | null };

export const reviewsQuery = (userId: string | null) =>
  queryOptions({
    queryKey: ["reviews", userId],
    enabled: !!userId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from("reviews")
          .select("*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, rating, location)")
          .eq("reviewee_id", userId!)
          .order("created_at", { ascending: false }),
      ) as ReviewRow[],
  });

/* ---------------- helpers ---------------- */

export function whenLabel(schedule: string | null) {
  if (!schedule) return "Flexible";
  const d = new Date(schedule);
  if (Number.isNaN(d.getTime())) return schedule;
  return d.toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}
