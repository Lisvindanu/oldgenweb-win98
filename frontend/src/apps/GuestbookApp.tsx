import { useEffect, useState } from "react";
import { Button, ScrollView, TextInput } from "react95";
import { API_URL } from "../config";

type Entry = {
  id: string;
  name: string;
  message: string;
  color: string;
  ts: number;
};

const MAX_NAME = 24;
const MAX_MESSAGE = 280;

export function GuestbookApp() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`${API_URL}/api/guestbook`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Entry[] = await res.json();
      setEntries(data);
      setError(null);
    } catch {
      setError("Could not load the guestbook.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/guestbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim().slice(0, MAX_NAME), message: msg.slice(0, MAX_MESSAGE) }),
      });
      if (res.status === 429) {
        setError("Slow down — one entry per 10 seconds.");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: Entry = await res.json();
      setEntries((prev) => [created, ...prev]);
      setMessage("");
    } catch {
      setError("Could not sign the guestbook.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <TextInput
          value={name}
          placeholder="Your name (optional)"
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
          fullWidth
        />
        <div style={{ display: "flex", gap: 6 }}>
          <TextInput
            value={message}
            placeholder="Leave a message…"
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
            fullWidth
          />
          <Button type="submit" disabled={submitting || !message.trim()}>
            Sign
          </Button>
        </div>
        <span style={{ fontSize: 11, color: error ? "#a00000" : "#555" }}>
          {error ?? `${message.length}/${MAX_MESSAGE} characters`}
        </span>
      </form>

      <ScrollView style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: 4, fontSize: 13, lineHeight: 1.5 }}>
          {loading && <p style={{ color: "#555" }}>Loading…</p>}
          {!loading && entries.length === 0 && (
            <p style={{ color: "#555" }}>Be the first to sign! ✍️</p>
          )}
          {entries.map((e) => (
            <div key={e.id} style={{ marginBottom: 8, borderBottom: "1px dotted #aaa", paddingBottom: 6 }}>
              <div style={{ wordBreak: "break-word" }}>{e.message}</div>
              <div style={{ fontSize: 11, color: "#555" }}>
                — <strong style={{ color: e.color }}>{e.name}</strong>
                {", "}
                {new Date(e.ts).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollView>
    </div>
  );
}
