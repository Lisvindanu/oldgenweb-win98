import { useRef, type ReactNode } from "react";
import { Button, Window, WindowContent, WindowHeader } from "react95";
import type { WinState } from "./useWindowManager";

type Props = {
  win: WinState;
  active: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
};

export function Win({ win, active, onClose, onMinimize, onFocus, onMove, children }: Props) {
  const dragging = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    onFocus();
    dragging.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const x = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragging.current.dx));
    const y = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragging.current.dy));
    onMove(x, y);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  if (win.minimized) return null;

  return (
    <Window
      onMouseDown={onFocus}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.z,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WindowHeader
        active={active}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "move",
          touchAction: "none",
        }}
      >
        <span style={{ userSelect: "none" }}>{win.title}</span>
        <span style={{ display: "flex", gap: 2 }}>
          <Button size="sm" square onClick={onMinimize} aria-label="Minimize">
            <span style={{ fontWeight: "bold", marginBottom: 6 }}>_</span>
          </Button>
          <Button size="sm" square onClick={onClose} aria-label="Close">
            <span style={{ fontWeight: "bold" }}>×</span>
          </Button>
        </span>
      </WindowHeader>
      <WindowContent style={{ flex: 1, overflow: "auto", paddingBottom: 8 }}>{children}</WindowContent>
    </Window>
  );
}
