import { AppBar, Button, Toolbar } from "react95";
import { appById } from "../apps/registry";
import type { WinState } from "./useWindowManager";
import { Clock } from "./Clock";

type Props = {
  windows: WinState[];
  activeId: string | null;
  startOpen: boolean;
  onToggleStart: () => void;
  onTaskClick: (id: string) => void;
  online: number;
  connected: boolean;
};

export function Taskbar({
  windows,
  activeId,
  startOpen,
  onToggleStart,
  onTaskClick,
  online,
  connected,
}: Props) {
  return (
    <AppBar style={{ top: "auto", bottom: 0, zIndex: 9000 }}>
      <Toolbar style={{ justifyContent: "space-between", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          <Button onClick={onToggleStart} active={startOpen} style={{ fontWeight: "bold", flexShrink: 0 }}>
            <span style={{ marginRight: 4 }}>🪟</span> Start
          </Button>

          <div style={{ display: "flex", gap: 4, overflow: "hidden", flex: 1 }}>
            {windows.map((w) => {
              const app = appById(w.appId);
              return (
                <Button
                  key={w.id}
                  active={activeId === w.id && !w.minimized}
                  onClick={() => onTaskClick(w.id)}
                  style={{
                    minWidth: 120,
                    maxWidth: 160,
                    justifyContent: "flex-start",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {app && (
                    <img
                      src={app.icon}
                      alt=""
                      width={16}
                      height={16}
                      style={{ marginRight: 6, imageRendering: "pixelated" }}
                    />
                  )}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{w.title}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(0,0,0,0.3)",
            boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.3)",
            padding: "2px 4px",
            flexShrink: 0,
          }}
          title={connected ? "Connected to server" : "Reconnecting…"}
        >
          <span style={{ fontSize: 12, userSelect: "none" }}>
            {connected ? "🟢" : "🔴"} {online}
          </span>
          <Clock />
        </div>
      </Toolbar>
    </AppBar>
  );
}
