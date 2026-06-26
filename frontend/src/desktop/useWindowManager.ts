import { useCallback, useRef, useState } from "react";

export type WinState = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
};

export type OpenOptions = {
  appId: string;
  title: string;
  width?: number;
  height?: number;
};

let seq = 0;

const MIN_WIDTH = 200;
const MIN_HEIGHT = 140;
const MOBILE_BREAKPOINT = 640;
const TASKBAR_HEIGHT = 52;
const MOBILE_MARGIN = 6;

// initialGeometry decides where/how big a freshly opened window is.
// On phones the floating-window metaphor breaks down, so windows open
// near-fullscreen instead of overflowing the viewport.
function initialGeometry(opts: OpenOptions, index: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < MOBILE_BREAKPOINT) {
    return {
      x: MOBILE_MARGIN,
      y: MOBILE_MARGIN,
      width: vw - MOBILE_MARGIN * 2,
      height: vh - TASKBAR_HEIGHT - MOBILE_MARGIN * 2,
    };
  }
  const offset = (index % 6) * 28;
  return { x: 64 + offset, y: 48 + offset, width: opts.width ?? 480, height: opts.height ?? 360 };
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WinState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const zCounter = useRef(1);

  const nextZ = () => (zCounter.current += 1);

  const focus = useCallback((id: string) => {
    const z = nextZ();
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
    setActiveId(id);
  }, []);

  const open = useCallback(
    (opts: OpenOptions) => {
      // One instance per app: focus it if already open.
      const existing = windows.find((w) => w.appId === opts.appId);
      if (existing) {
        focus(existing.id);
        return;
      }
      const id = `win-${seq++}`;
      const geo = initialGeometry(opts, windows.length);
      const z = nextZ();
      setWindows((ws) => [
        ...ws,
        {
          id,
          appId: opts.appId,
          title: opts.title,
          ...geo,
          z,
          minimized: false,
        },
      ]);
      setActiveId(id);
    },
    [windows, focus],
  );

  const close = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const move = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resize = useCallback((id: string, width: number, height: number) => {
    const w = Math.max(MIN_WIDTH, width);
    const h = Math.max(MIN_HEIGHT, height);
    setWindows((ws) => ws.map((win) => (win.id === id ? { ...win, width: w, height: h } : win)));
  }, []);

  const toggleFromTaskbar = useCallback(
    (id: string) => {
      const w = windows.find((win) => win.id === id);
      if (!w) return;
      if (w.minimized || activeId !== id) {
        focus(id);
      } else {
        minimize(id);
      }
    },
    [windows, activeId, focus, minimize],
  );

  return { windows, activeId, open, close, minimize, move, resize, focus, toggleFromTaskbar };
}
