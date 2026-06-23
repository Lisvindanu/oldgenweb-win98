import { useEffect, useRef, useState } from "react";
import { Button, ScrollView, TextInput } from "react95";
import { useSocket } from "../ws/SocketProvider";

export function ChatApp() {
  const { messages, sendChat, connected } = useSocket();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendChat(t);
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      <ScrollView style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: 4, fontSize: 13, lineHeight: 1.5 }}>
          {messages.length === 0 && (
            <p style={{ color: "#555" }}>No messages yet. Say hi! 👋</p>
          )}
          {messages.map((m, i) =>
            "system" in m ? (
              <p key={i} style={{ color: "#777", fontStyle: "italic" }}>
                * {m.text}
              </p>
            ) : (
              <p key={i} style={{ margin: "2px 0", wordBreak: "break-word" }}>
                <strong style={{ color: m.color }}>{m.name}:</strong> {m.text}
              </p>
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollView>

      <form onSubmit={submit} style={{ display: "flex", gap: 6 }}>
        <TextInput
          value={text}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          onChange={(e) => setText(e.target.value)}
          disabled={!connected}
          fullWidth
        />
        <Button type="submit" disabled={!connected || !text.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
