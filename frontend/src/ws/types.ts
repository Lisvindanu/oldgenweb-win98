export type User = {
  id: string;
  name: string;
  color: string;
};

export type ChatMessage = {
  id: string;
  name: string;
  color: string;
  text: string;
  ts: number;
};

export type SystemMessage = {
  text: string;
  ts: number;
};

export type Cursor = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
};

export type PaintSegment = {
  px: number;
  py: number;
  x: number;
  y: number;
  color: string;
  size: number;
};

// Server -> client frames
export type ServerFrame =
  | { type: "welcome"; id: string; color: string }
  | { type: "presence"; users: User[] }
  | { type: "chat"; id: string; name: string; color: string; text: string; ts: number }
  | { type: "system"; text: string; ts: number }
  | { type: "cursor"; id: string; x: number; y: number }
  | { type: "leave"; id: string }
  | ({ type: "paint" } & PaintSegment)
  | { type: "paintclear" };
