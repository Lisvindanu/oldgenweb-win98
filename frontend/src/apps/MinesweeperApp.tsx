import { useEffect, useMemo, useState } from "react";
import { Button } from "react95";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
};

type GameState = "playing" | "won" | "lost";

const NUM_COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })),
  );
}

// Place mines avoiding the first-clicked cell, then compute neighbor counts.
function placeMines(board: Cell[][], safeR: number, safeC: number): Cell[][] {
  const next = board.map((row) => row.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (next[r][c].mine || (r === safeR && c === safeC)) continue;
    next[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c].mine) continue;
      next[r][c].count = neighbors(r, c).filter(([nr, nc]) => next[nr][nc].mine).length;
    }
  }
  return next;
}

function neighbors(r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

// Flood-reveal empty regions starting at (r,c). Mutates the passed board.
function floodReveal(board: Cell[][], r: number, c: number) {
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine) {
      for (const [nr, nc] of neighbors(cr, cc)) {
        if (!board[nr][nc].revealed) stack.push([nr, nc]);
      }
    }
  }
}

export function MinesweeperApp() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
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
    setBoard(emptyBoard());
    setState("playing");
    setStarted(false);
    setSeconds(0);
  };

  const reveal = (r: number, c: number) => {
    if (state !== "playing") return;
    setBoard((prev) => {
      let working = prev;
      if (!started) {
        working = placeMines(prev, r, c);
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

      floodReveal(next, r, c);

      const safeLeft = next.flat().filter((cl) => !cl.mine && !cl.revealed).length;
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
