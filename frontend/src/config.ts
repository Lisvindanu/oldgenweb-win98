// In dev the Go backend runs on :8080; in prod the frontend is served by Go itself.
const isDev = import.meta.env.DEV;

export const WS_URL = isDev
  ? "ws://localhost:8080/ws"
  : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;

// REST base for HTTP endpoints (guestbook). In prod the Go server hosts both.
export const API_URL = isDev ? "http://localhost:8080" : "";
