import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WS_URL } from "../config";
import type { ChatMessage, Cursor, PaintSegment, ServerFrame, User } from "./types";

type PaintHandler = (seg: PaintSegment) => void;
type ClearHandler = () => void;

type SocketState = {
  connected: boolean;
  myId: string | null;
  users: User[];
  messages: (ChatMessage | { system: true; text: string; ts: number })[];
  cursors: Record<string, Cursor>;
  sendHello: (name: string) => void;
  sendChat: (text: string) => void;
  sendCursor: (x: number, y: number) => void;
  sendPaint: (seg: PaintSegment) => void;
  sendPaintClear: () => void;
  subscribePaint: (onPaint: PaintHandler, onClear: ClearHandler) => () => void;
};

const SocketContext = createContext<SocketState | null>(null);

const MAX_MESSAGES = 200;

export function SocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usersRef = useRef<User[]>([]);
  const paintHandlers = useRef<Set<PaintHandler>>(new Set());
  const clearHandlers = useRef<Set<ClearHandler>>(new Set());

  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<SocketState["messages"]>([]);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});

  const send = useCallback((payload: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    let closedByUnmount = false;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onclose = () => {
        setConnected(false);
        if (!closedByUnmount) {
          reconnectRef.current = setTimeout(connect, 1500);
        }
      };

      ws.onerror = () => ws.close();

      ws.onmessage = (ev) => {
        let frame: ServerFrame;
        try {
          frame = JSON.parse(ev.data);
        } catch {
          return;
        }
        handleFrame(frame);
      };
    };

    const handleFrame = (frame: ServerFrame) => {
      switch (frame.type) {
        case "welcome":
          setMyId(frame.id);
          break;
        case "presence":
          usersRef.current = frame.users;
          setUsers(frame.users);
          break;
        case "chat":
          setMessages((prev) =>
            [...prev, { id: frame.id, name: frame.name, color: frame.color, text: frame.text, ts: frame.ts }].slice(
              -MAX_MESSAGES,
            ),
          );
          break;
        case "system":
          setMessages((prev) =>
            [...prev, { system: true as const, text: frame.text, ts: frame.ts }].slice(-MAX_MESSAGES),
          );
          break;
        case "cursor": {
          const owner = usersRef.current.find((u) => u.id === frame.id);
          if (!owner) return;
          setCursors((prev) => ({
            ...prev,
            [frame.id]: { id: frame.id, name: owner.name, color: owner.color, x: frame.x, y: frame.y },
          }));
          break;
        }
        case "leave":
          setCursors((prev) => {
            const next = { ...prev };
            delete next[frame.id];
            return next;
          });
          break;
        case "paint": {
          const { px, py, x, y, color, size } = frame;
          paintHandlers.current.forEach((h) => h({ px, py, x, y, color, size }));
          break;
        }
        case "paintclear":
          clearHandlers.current.forEach((h) => h());
          break;
      }
    };

    connect();

    return () => {
      closedByUnmount = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  const sendHello = useCallback((name: string) => send({ type: "hello", name }), [send]);
  const sendChat = useCallback((text: string) => send({ type: "chat", text }), [send]);
  const sendCursor = useCallback((x: number, y: number) => send({ type: "cursor", x, y }), [send]);
  const sendPaint = useCallback((seg: PaintSegment) => send({ type: "paint", ...seg }), [send]);
  const sendPaintClear = useCallback(() => send({ type: "paintclear" }), [send]);
  const subscribePaint = useCallback((onPaint: PaintHandler, onClear: ClearHandler) => {
    paintHandlers.current.add(onPaint);
    clearHandlers.current.add(onClear);
    return () => {
      paintHandlers.current.delete(onPaint);
      clearHandlers.current.delete(onClear);
    };
  }, []);

  const value: SocketState = {
    connected,
    myId,
    users,
    messages,
    cursors,
    sendHello,
    sendChat,
    sendCursor,
    sendPaint,
    sendPaintClear,
    subscribePaint,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketState {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
