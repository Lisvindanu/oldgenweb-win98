import { useSocket } from "../ws/SocketProvider";

export function OnlineApp() {
  const { users, myId } = useSocket();

  return (
    <div style={{ fontSize: 13 }}>
      <p style={{ marginBottom: 8 }}>
        <strong>{users.length}</strong> {users.length === 1 ? "person" : "people"} online
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users.map((u) => (
          <li key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: u.color,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span>
              {u.name}
              {u.id === myId && <em style={{ color: "#777" }}> (you)</em>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
