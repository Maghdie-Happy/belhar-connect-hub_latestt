import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { notifications as initialNotifications } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Connectly" },
      {
        name: "description",
        content: "Applications, messages, reviews and payments — everything happening on your jobs.",
      },
      { property: "og:title", content: "Notifications — Connectly" },
      { property: "og:description", content: "Stay on top of your Connectly activity." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications.map((n) => ({ ...n, id: n.title }))
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setShowConfirm(false);
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  return (
    <AppShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      action={
        unreadCount > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-secondary !h-10 !px-4 !text-sm"
            title="Mark all notifications as read"
          >
            Mark all as read
          </button>
        )
      }
    >
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card-surface max-w-sm space-y-4 p-6">
            <h3 className="font-display text-lg font-bold">Mark all as read?</h3>
            <p className="text-sm text-muted-foreground">
              This will mark all {unreadCount} unread notifications as read.
            </p>
            <div className="flex gap-3">
              <button onClick={markAllAsRead} className="btn-primary flex-1">
                Yes, mark all
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-surface divide-y divide-border overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4 transition-colors ${
                n.unread ? "bg-accent/40 hover:bg-accent/50" : "hover:bg-muted"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted">
                {n.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{n.title}</span>
                <span className="block truncate text-sm text-muted-foreground">{n.body}</span>
                <span className="block text-xs text-muted-foreground">{n.time}</span>
              </span>
              <div className="flex shrink-0 items-start gap-2">
                {n.unread && (
                  <>
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="pill bg-muted text-muted-foreground text-xs hover:bg-border"
                      title="Mark as read"
                    >
                      Read
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="pill bg-muted text-muted-foreground text-xs hover:bg-destructive/10 hover:text-destructive"
                  title="Delete notification"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notifications yet. You're all caught up!
          </div>
        )}
      </div>
    </AppShell>
  );
}
