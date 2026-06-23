import { useEffect, useState } from "react";

type Props = { onDone: () => void };

const BOOT_MS = 2600;

// Fake "Starting Windows 98" splash. Shown once, then fades into the desktop.
export function BootScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const pct = Math.min(100, ((t - start) / BOOT_MS) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setFading(true);
        setTimeout(onDone, 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#000",
        color: "#c0c0c0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        fontFamily: "'ms_sans_serif', sans-serif",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div style={{ textAlign: "center", lineHeight: 1.6 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🪟</div>
        <div style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          OldGenWeb<span style={{ color: "#00a2e8" }}>98</span>
        </div>
        <div style={{ fontSize: 14, color: "#888" }}>Starting OldGenWeb…</div>
      </div>

      <div
        style={{
          width: 240,
          height: 18,
          border: "2px inset #555",
          background: "#111",
          padding: 2,
          display: "flex",
          gap: 2,
          overflow: "hidden",
        }}
      >
        {/* Classic segmented progress blocks */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: progress > (i / 16) * 100 ? "#00a2e8" : "transparent",
              transition: "background 0.1s",
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 16, fontSize: 11, color: "#555" }}>
        © 1998–2026 OldGenWeb · best viewed in 800×600
      </div>
    </div>
  );
}
