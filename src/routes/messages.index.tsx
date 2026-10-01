import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { conversations } from "@/lib/data";

export const Route = createFileRoute("/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — Connectly" },
      {
        name: "description",
        content: "Chat with workers and clients about jobs in Belhar, safely inside Connectly.",
      },
      { property: "og:title", content: "Messages — Connectly" },
      { property: "og:description", content: "Your Connectly conversations." },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <AppShell title="Messages" subtitle="Chat before you commit to a job">
      <div className="card-surface divide-y divide-border overflow-hidden">
        {conversations.map((c) => (
          <Link
            key={c.id}
            to="/messages/$chatId"
            params={{ chatId: c.id }}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 transition-colors hover:bg-muted"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-display font-bold text-primary">
              {c.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold">{c.name}</span>
                <span className="pill bg-muted text-muted-foreground">{c.role}</span>
              </span>
              <span className="block truncate text-sm text-muted-foreground">{c.last}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-xs text-muted-foreground">{c.time}</span>
              {c.unread > 0 && (
                <span className="mt-1 inline-grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {c.unread}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
