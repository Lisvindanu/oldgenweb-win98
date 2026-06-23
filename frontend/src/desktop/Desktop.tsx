import { useEffect, useRef, useState } from "react";
import { APPS, appById } from "../apps/registry";
import { useSocket } from "../ws/SocketProvider";
import { CursorLayer } from "../presence/CursorLayer";
import { DesktopIcon } from "./DesktopIcon";
import { StartMenu } from "./StartMenu";
import { Taskbar } from "./Taskbar";
import { Win } from "./Win";
import { useWindowManager } from "./useWindowManager";

const CURSOR_THROTTLE_MS = 50;

export function Desktop() {
  const wm = useWindowManager();
  const { users, connected, sendCursor } = useSocket();
  const [startOpen, setStartOpen] = useState(false);
  const lastSent = useRef(0);

  // Broadcast our cursor as viewport fractions, throttled.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSent.current < CURSOR_THROTTLE_MS) return;
      lastSent.current = now;
      sendCursor(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [sendCursor]);

  const launch = (appId: string) => {
    const app = appById(appId);
    if (!app) return;
    wm.open({ appId: app.id, title: app.title, width: app.width, height: app.height });
  };

  return (
    <div
      onPointerDown={() => setStartOpen(false)}
      style={{ position: "fixed", inset: 0, overflow: "hidden" }}
    >
      {/* Desktop icons */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 1,
        }}
      >
        {APPS.map((app) => (
          <DesktopIcon
            key={app.id}
            icon={app.icon}
            label={app.title.replace("C:\\", "")}
            onOpen={() => launch(app.id)}
          />
        ))}
      </div>

      {/* Windows */}
      {wm.windows.map((w) => {
        const app = appById(w.appId);
        const Body = app?.component;
        return (
          <Win
            key={w.id}
            win={w}
            active={wm.activeId === w.id}
            onClose={() => wm.close(w.id)}
            onMinimize={() => wm.minimize(w.id)}
            onFocus={() => wm.focus(w.id)}
            onMove={(x, y) => wm.move(w.id, x, y)}
          >
            {Body ? <Body /> : null}
          </Win>
        );
      })}

      {/* Live cursors */}
      <CursorLayer />

      {/* Start menu */}
      {startOpen && (
        <div onPointerDown={(e) => e.stopPropagation()}>
          <StartMenu onLaunch={launch} onClose={() => setStartOpen(false)} />
        </div>
      )}

      {/* Taskbar */}
      <div onPointerDown={(e) => e.stopPropagation()}>
        <Taskbar
          windows={wm.windows}
          activeId={wm.activeId}
          startOpen={startOpen}
          onToggleStart={() => setStartOpen((s) => !s)}
          onTaskClick={wm.toggleFromTaskbar}
          online={users.length}
          connected={connected}
        />
      </div>
    </div>
  );
}
