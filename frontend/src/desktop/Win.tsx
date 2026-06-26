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
  onResize: (width: number, height: number) => void;
  children: ReactNode;
};

export function Win({
  win,
  active,
  onClose,
  onMinimize,
  onFocus,
  onMove,
  onResize,
  children,
}: Props) {
  const dragging = useRef<{ dx: number; dy: number } | null>(null);
  const resizing = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null);

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

  const onResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onFocus();
    resizing.current = { startX: e.clientX, startY: e.clientY, w: win.width, h: win.height };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    const width = resizing.current.w + (e.clientX - resizing.current.startX);
    const height = resizing.current.h + (e.clientY - resizing.current.startY);
    onResize(width, height);
  };

  const onResizeUp = (e: React.PointerEvent) => {
    resizing.current = null;
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
      <div
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
        aria-label="Resize"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 18,
          height: 18,
          cursor: "nwse-resize",
          touchAction: "none",
          background:
            "linear-gradient(135deg, transparent 0 45%, rgba(0,0,0,0.45) 45% 55%, transparent 55% 70%, rgba(0,0,0,0.45) 70% 80%, transparent 80%)",
        }}
      />
    </Window>
  );
}
