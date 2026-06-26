import { useState } from "react";
import { Button, ScrollView, TextInput } from "react95";
import { GREETING, TIPS, respond } from "../lib/clippy";

export function ClippyApp() {
  const [log, setLog] = useState<string[]>([GREETING]);
  const [input, setInput] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setLog((prev) => [...prev, `> ${t}`, respond(t)]);
    setInput("");
  };

  const randomTip = () => {
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    setLog((prev) => [...prev, tip]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 32, lineHeight: 1 }}>📎</div>
        <strong style={{ fontSize: 14 }}>Clippy, your assistant</strong>
      </div>

      <ScrollView style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: 6, fontSize: 13, lineHeight: 1.6 }}>
          {log.map((line, i) => (
            <p
              key={i}
              style={{
                margin: "3px 0",
                color: line.startsWith("> ") ? "#000080" : "#000",
                fontStyle: line.startsWith("> ") ? "italic" : "normal",
                wordBreak: "break-word",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </ScrollView>

      <form onSubmit={submit} style={{ display: "flex", gap: 6 }}>
        <TextInput
          value={input}
          placeholder="Ask Clippy…"
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          fullWidth
        />
        <Button type="submit" disabled={!input.trim()}>
          Ask
        </Button>
        <Button type="button" onClick={randomTip}>
          💡 Tip
        </Button>
      </form>
    </div>
  );
}
