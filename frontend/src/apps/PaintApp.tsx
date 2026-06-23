import { useEffect, useRef, useState } from "react";
import { Button } from "react95";
import { useSocket } from "../ws/SocketProvider";
import type { PaintSegment } from "../ws/types";

const CANVAS_W = 560;
const CANVAS_H = 360;
const PAINT_THROTTLE_MS = 20;

const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200",
  "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#ffaec9",
];

const SIZES = [2, 5, 12, 24];

export function PaintApp() {
  const { sendPaint, sendPaintClear, subscribePaint } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastSent = useRef(0);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  colorRef.current = color;
  sizeRef.current = size;

  // Draw a single segment in normalized (0..1) coordinates.
  const drawSegment = (seg: PaintSegment) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = seg.size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(seg.px * CANVAS_W, seg.py * CANVAS_H);
    ctx.lineTo(seg.x * CANVAS_W, seg.y * CANVAS_H);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    clearCanvas();
    const unsub = subscribePaint(
      (seg) => drawSegment(seg),
      () => clearCanvas(),
    );
    return unsub;
  }, [subscribePaint]);

  const toNorm = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drawing.current = true;
    const p = toNorm(e);
    lastPoint.current = p;
    canvasRef.current?.setPointerCapture(e.pointerId);
    // A single click should leave a dot, not nothing.
    const seg: PaintSegment = {
      px: p.x,
      py: p.y,
      x: p.x,
      y: p.y,
      color: colorRef.current,
      size: sizeRef.current,
    };
    drawSegment(seg);
    sendPaint(seg);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !lastPoint.current) return;
    const now = performance.now();
    if (now - lastSent.current < PAINT_THROTTLE_MS) return;
    lastSent.current = now;

    const point = toNorm(e);
    const seg: PaintSegment = {
      px: lastPoint.current.x,
      py: lastPoint.current.y,
      x: point.x,
      y: point.y,
      color: colorRef.current,
      size: sizeRef.current,
    };
    drawSegment(seg);
    sendPaint(seg);
    lastPoint.current = point;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    drawing.current = false;
    lastPoint.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clearAll = () => {
    clearCanvas();
    sendPaintClear();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            style={{
              width: 20,
              height: 20,
              background: c,
              border: color === c ? "2px solid #000080" : "1px solid #555",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12 }}>Brush:</span>
        {SIZES.map((s) => (
          <Button key={s} size="sm" active={size === s} onClick={() => setSize(s)} square>
            {s}
          </Button>
        ))}
        <Button size="sm" onClick={clearAll} style={{ marginLeft: "auto" }}>
          Clear (everyone)
        </Button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", placeItems: "center" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            display: "block",
            width: CANVAS_W,
            height: CANVAS_H,
            background: "#fff",
            border: "2px inset #c0c0c0",
            cursor: "crosshair",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
