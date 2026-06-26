export type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
};

export type Board = Cell[][];

export type GameConfig = {
  rows: number;
  cols: number;
  mines: number;
};

export const DEFAULT_CONFIG: GameConfig = { rows: 9, cols: 9, mines: 10 };

export function emptyBoard(cfg: GameConfig): Board {
  return Array.from({ length: cfg.rows }, () =>
    Array.from({ length: cfg.cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      count: 0,
    })),
  );
}

export function neighbors(cfg: GameConfig, r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) out.push([nr, nc]);
    }
  }
  return out;
}

// Place mines avoiding the first-clicked cell, then compute neighbor counts.
// rng is injectable so the placement can be made deterministic in tests.
export function placeMines(
  cfg: GameConfig,
  board: Board,
  safeR: number,
  safeC: number,
  rng: () => number = Math.random,
): Board {
  const next = board.map((row) => row.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < cfg.mines) {
    const r = Math.floor(rng() * cfg.rows);
    const c = Math.floor(rng() * cfg.cols);
    if (next[r][c].mine || (r === safeR && c === safeC)) continue;
    next[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < cfg.rows; r++) {
    for (let c = 0; c < cfg.cols; c++) {
      if (next[r][c].mine) continue;
      next[r][c].count = neighbors(cfg, r, c).filter(([nr, nc]) => next[nr][nc].mine).length;
    }
  }
  return next;
}

// Flood-reveal empty regions starting at (r,c). Mutates the passed board.
export function floodReveal(cfg: GameConfig, board: Board, r: number, c: number): void {
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine) {
      for (const [nr, nc] of neighbors(cfg, cr, cc)) {
        if (!board[nr][nc].revealed) stack.push([nr, nc]);
      }
    }
  }
}

export function countSafeRemaining(board: Board): number {
  return board.flat().filter((cl) => !cl.mine && !cl.revealed).length;
}

export function countMines(board: Board): number {
  return board.flat().filter((cl) => cl.mine).length;
}
