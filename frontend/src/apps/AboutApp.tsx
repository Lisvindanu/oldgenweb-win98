export function AboutApp() {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
      <h2 style={{ margin: "0 0 8px" }}>OldGenWeb 98 💾</h2>
      <p>
        A website that <strong>looks like 1998</strong> but runs on <strong>2026</strong> tech.
      </p>
      <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
        <li>Real-time chat over WebSocket (Go backend)</li>
        <li>Live presence — see other visitors' cursors move</li>
        <li>Draggable windows, taskbar &amp; Start menu</li>
        <li>React + react95 + Go</li>
      </ul>
      <p style={{ marginTop: 12, color: "#555" }}>
        Open another browser tab to chat with yourself and watch the cursors. 🖱️
      </p>
      <p style={{ marginTop: 12, fontFamily: "monospace", fontSize: 11, color: "#777" }}>
        Best viewed in Netscape Navigator at 800×600 — just kidding, it's responsive.
      </p>
    </div>
  );
}
