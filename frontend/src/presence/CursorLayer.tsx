import { useSocket } from "../ws/SocketProvider";

// Renders remote visitors' cursors. Coordinates are sent as viewport
// fractions (0..1) so they map correctly across different screen sizes.
export function CursorLayer() {
  const { cursors, myId } = useSocket();

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10000 }}>
      {Object.values(cursors)
        .filter((c) => c.id !== myId)
        .map((c) => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              transform: "translate(-2px, -2px)",
              transition: "left 80ms linear, top 80ms linear",
              willChange: "left, top",
            }}
          >
            <svg width="18" height="24" viewBox="0 0 18 24" style={{ display: "block" }}>
              <path
                d="M2 2 L2 18 L6 14 L9 21 L12 20 L9 13 L15 13 Z"
                fill={c.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                marginLeft: 12,
                background: c.color,
                color: "white",
                fontSize: 11,
                padding: "1px 5px",
                borderRadius: 2,
                whiteSpace: "nowrap",
                boxShadow: "1px 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {c.name}
            </span>
          </div>
        ))}
    </div>
  );
}
