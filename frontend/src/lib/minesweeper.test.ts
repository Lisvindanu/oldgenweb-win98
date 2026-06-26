import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  countMines,
  countSafeRemaining,
  emptyBoard,
  floodReveal,
  neighbors,
  placeMines,
  type GameConfig,
} from "./minesweeper";

const CFG = DEFAULT_CONFIG;

describe("emptyBoard", () => {
  it("creates a rows x cols grid of unrevealed empty cells", () => {
    const b = emptyBoard(CFG);
    expect(b).toHaveLength(CFG.rows);
    expect(b[0]).toHaveLength(CFG.cols);
    expect(b.flat().every((c) => !c.mine && !c.revealed && !c.flagged && c.count === 0)).toBe(true);
  });
});

describe("neighbors", () => {
  it("returns 3 neighbors for a corner", () => {
    expect(neighbors(CFG, 0, 0)).toHaveLength(3);
  });
  it("returns 5 neighbors for an edge", () => {
    expect(neighbors(CFG, 0, 4)).toHaveLength(5);
  });
  it("returns 8 neighbors for an interior cell", () => {
    expect(neighbors(CFG, 4, 4)).toHaveLength(8);
  });
  it("never includes the cell itself", () => {
    expect(neighbors(CFG, 4, 4)).not.toContainEqual([4, 4]);
  });
});

describe("placeMines", () => {
  it("places exactly cfg.mines mines", () => {
    const b = placeMines(CFG, emptyBoard(CFG), 0, 0);
    expect(countMines(b)).toBe(CFG.mines);
  });

  it("never mines the first-clicked safe cell", () => {
    for (let i = 0; i < 50; i++) {
      const b = placeMines(CFG, emptyBoard(CFG), 4, 4);
      expect(b[4][4].mine).toBe(false);
    }
  });

  it("computes neighbor counts that match actual adjacent mines", () => {
    const b = placeMines(CFG, emptyBoard(CFG), 4, 4);
    for (let r = 0; r < CFG.rows; r++) {
      for (let c = 0; c < CFG.cols; c++) {
        if (b[r][c].mine) continue;
        const actual = neighbors(CFG, r, c).filter(([nr, nc]) => b[nr][nc].mine).length;
        expect(b[r][c].count).toBe(actual);
      }
    }
  });

  it("is deterministic with an injected rng", () => {
    const seq = [0.1, 0.1, 0.9, 0.9, 0.5, 0.5];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const a = placeMines({ rows: 3, cols: 3, mines: 2 }, emptyBoard({ rows: 3, cols: 3, mines: 2 }), 1, 1, rng);
    i = 0;
    const b = placeMines({ rows: 3, cols: 3, mines: 2 }, emptyBoard({ rows: 3, cols: 3, mines: 2 }), 1, 1, rng);
    expect(a).toEqual(b);
    expect(countMines(a)).toBe(2);
  });
});

describe("floodReveal", () => {
  it("reveals a connected empty region up to its numbered border", () => {
    // A board with one mine in the corner; clicking far away floods most cells.
    const cfg: GameConfig = { rows: 3, cols: 3, mines: 1 };
    const board = emptyBoard(cfg);
    board[0][0].mine = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c].mine) continue;
        board[r][c].count = neighbors(cfg, r, c).filter(([nr, nc]) => board[nr][nc].mine).length;
      }
    }
    floodReveal(cfg, board, 2, 2);
    // The mine stays hidden; all 8 non-mine cells get revealed.
    expect(board[0][0].revealed).toBe(false);
    expect(countSafeRemaining(board)).toBe(0);
  });

  it("does not reveal flagged cells", () => {
    const cfg: GameConfig = { rows: 2, cols: 2, mines: 0 };
    const board = emptyBoard(cfg);
    board[0][1].flagged = true;
    floodReveal(cfg, board, 0, 0);
    expect(board[0][1].revealed).toBe(false);
  });
});

describe("countSafeRemaining", () => {
  it("counts unrevealed non-mine cells", () => {
    const cfg: GameConfig = { rows: 2, cols: 2, mines: 1 };
    const board = emptyBoard(cfg);
    board[0][0].mine = true;
    board[0][1].revealed = true;
    // remaining safe = (1,0) and (1,1) = 2
    expect(countSafeRemaining(board)).toBe(2);
  });
});
