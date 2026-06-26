import { useEffect, useMemo, useState } from "react";
import { Button } from "react95";
import {
  DEFAULT_CONFIG,
  countSafeRemaining,
  emptyBoard,
  floodReveal,
  placeMines,
  type Cell,
} from "../lib/minesweeper";

const CFG = DEFAULT_CONFIG;
const ROWS = CFG.rows;
const COLS = CFG.cols;
const MINES = CFG.mines;

type GameState = "playing" | "won" | "lost";

const NUM_COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

export function MinesweeperApp() {
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard(CFG));
  const [state, setState] = useState<GameState>("playing");
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const flags = useMemo(
    () => board.reduce((n, row) => n + row.filter((c) => c.flagged).length, 0),
    [board],
  );

  useEffect(() => {
    if (!started || state !== "playing") return;
    const id = setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    return () => clearInterval(id);
  }, [started, state]);

  const reset = () => {
    setBoard(emptyBoard(CFG));
    setState("playing");
    setStarted(false);
    setSeconds(0);
  };

  const reveal = (r: number, c: number) => {
    if (state !== "playing") return;
    setBoard((prev) => {
      let working = prev;
      if (!started) {
        working = placeMines(CFG, prev, r, c);
        setStarted(true);
      }
      const next = working.map((row) => row.map((cell) => ({ ...cell })));
      const cell = next[r][c];
      if (cell.revealed || cell.flagged) return next;

      if (cell.mine) {
        next.forEach((row) => row.forEach((cl) => { if (cl.mine) cl.revealed = true; }));
        setState("lost");
        return next;
      }

      floodReveal(CFG, next, r, c);

      const safeLeft = countSafeRemaining(next);
      if (safeLeft === 0) {
        next.forEach((row) => row.forEach((cl) => { if (cl.mine) cl.flagged = true; }));
        setState("won");
      }
      return next;
    });
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (state !== "playing" || !started) return;
    setBoard((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      const cell = next[r][c];
      if (!cell.revealed) cell.flagged = !cell.flagged;
      return next;
    });
  };

  const face = state === "won" ? "😎" : state === "lost" ? "😵" : "🙂";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: COLS * 26,
          padding: "4px 8px",
          background: "#c0c0c0",
          border: "2px inset #fff",
        }}
      >
        <span style={counterStyle}>{String(Math.max(0, MINES - flags)).padStart(3, "0")}</span>
        <Button onClick={reset} style={{ fontSize: 18, minWidth: 36 }}>{face}</Button>
        <span style={counterStyle}>{String(seconds).padStart(3, "0")}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 24px)`,
          gridTemplateRows: `repeat(${ROWS}, 24px)`,
          gap: 0,
          border: "2px inset #fff",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              style={cellStyle(cell)}
            >
              {cellLabel(cell)}
            </button>
          )),
        )}
      </div>

      <span style={{ fontSize: 12, color: "#333" }}>
        {state === "won" ? "You cleared it! 🎉" : state === "lost" ? "Boom! Click 🙂 to retry." : "Left-click reveal · Right-click flag"}
      </span>
    </div>
  );
}

const counterStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: 18,
  color: "#ff0000",
  background: "#000",
  padding: "0 4px",
  minWidth: 44,
  textAlign: "center",
};

function cellStyle(cell: Cell): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 24,
    height: 24,
    padding: 0,
    fontWeight: "bold",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "monospace",
    lineHeight: "24px",
  };
  if (cell.revealed) {
    return {
      ...base,
      border: "1px solid #999",
      background: cell.mine ? "#ff4040" : "#d4d0c8",
      color: NUM_COLORS[cell.count] || "#000",
      cursor: "default",
    };
  }
  return {
    ...base,
    border: "2px outset #fff",
    background: "#c0c0c0",
  };
}

function cellLabel(cell: Cell): string {
  if (cell.flagged) return "🚩";
  if (!cell.revealed) return "";
  if (cell.mine) return "💣";
  return cell.count > 0 ? String(cell.count) : "";
}
