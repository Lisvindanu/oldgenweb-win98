import { useState } from "react";
import { Button, Frame, TextInput } from "react95";
import { useSocket } from "./ws/SocketProvider";

export function NameGate({ onDone }: { onDone: () => void }) {
  const { sendHello, connected } = useSocket();
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    sendHello(n);
    onDone();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        zIndex: 20000,
      }}
    >
      <Frame variant="window" style={{ width: 360, padding: 0 }}>
        <div style={{ background: "#000080", color: "white", padding: "4px 8px", fontWeight: "bold" }}>
          Welcome to OldGenWeb 98
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 32, textAlign: "center" }}>💾</div>
          <p style={{ fontSize: 13, textAlign: "center", margin: 0 }}>
            Type your name to log on to the network.
          </p>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            autoFocus
            fullWidth
          />
          <Button type="submit" disabled={!name.trim() || !connected} fullWidth>
            {connected ? "Log On" : "Connecting…"}
          </Button>
        </form>
      </Frame>
    </div>
  );
}
