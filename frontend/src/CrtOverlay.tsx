// Full-screen CRT effect: scanlines + subtle vignette + flicker.
// pointer-events: none so it never blocks interaction with the desktop.
export function CrtOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        pointerEvents: "none",
        background:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
        boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)",
        mixBlendMode: "multiply",
        animation: "crtFlicker 6s infinite steps(60)",
      }}
    />
  );
}
