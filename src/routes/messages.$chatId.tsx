import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { chatThread, conversations } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/messages/$chatId")({
  head: () => ({
    meta: [
      { title: "Chat — Connectly" },
      {
        name: "description",
        content: "Your conversation about a Connectly job in Belhar, Cape Town.",
      },
      { property: "og:title", content: "Chat — Connectly" },
      { property: "og:description", content: "Message workers and clients on Connectly." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { chatId } = Route.useParams();
  const convo = conversations.find((c) => c.id === chatId) ?? conversations[0]!;
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState(chatThread[convo.id] ?? []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      toast.error("Type a message before sending.");
      return;
    }
    setThread((prev) => [
      ...prev,
      {
        from: "me",
        text: draft.trim(),
        time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
    toast.success("Message sent");
  };

  return (
    <AppShell
      title={convo.name}
      subtitle={convo.role}
      action={
        <Link to="/messages" className="btn-secondary !h-10 !px-4 !text-sm">
          ← All messages
        </Link>
      }
    >
      <div className="card-surface flex h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {thread.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-xl px-4 py-2.5 text-sm ${
                  m.from === "me"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
                <span
                  className={`mt-1 block text-[10px] ${
                    m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 border-t border-border p-3"
          onSubmit={sendMessage}
        >
          <input
            className="field"
            placeholder="Write a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button className="btn-primary !px-5">Send</button>
        </form>
      </div>
    </AppShell>
  );
}
