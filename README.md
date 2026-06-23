# OldGenWeb — Win98 Edition

```
 ____________________________________________________________
|  OldGenWeb  [_][▫][X] |  C:\>  A retro desktop, live for all  |
|=============================================================|
|   _______                                                   |
|  |  ___  |   Welcome to the World Wide Web, circa 1998.     |
|  | |MSN| |   ...except it runs on 2026 plumbing.            |
|  |_______|                                                  |
|   [ Chat ]  [ Paint ]  [ Who's Online ]  [ About ]          |
|_____________________________________________________________|
|  Start |  ☼ 12:00 PM                                  [|||]  |
|_____________________________________________________________|
```

> A Windows 98 desktop that lives in your browser — draggable windows,
> Start menu, taskbar — wired to a real-time backend so everyone shares
> the same room. Chat like it's mIRC, watch other visitors' cursors glide
> across the desktop, and scribble together on a shared MS Paint canvas.
>
> **Tampilan jadul, kemampuan 2026.**

---

## ✦ Features

| App | What it does |
|-----|--------------|
| 💬 **Chat** | MSN/mIRC-style live chat, broadcast to everyone in the room |
| 👥 **Who's Online** | Live presence list — see who just walked in |
| 🖱️ **Live Cursors** | Other visitors' mouse pointers move across your desktop in real time |
| 🎨 **Paint (shared)** | Collaborative MS Paint — every stroke is broadcast to all painters |

All windows are draggable, minimizable, and stack with real z-ordering,
just like the real thing.

---

## ✦ Tech Stack

**Frontend**
- React 19 + Vite + TypeScript
- [react95](https://react95.io/) — the authentic Win98 component kit
- styled-components
- Native WebSocket client with auto-reconnect

**Backend**
- Go 1.25 (`module oldgenweb/backend`)
- [gorilla/websocket](https://github.com/gorilla/websocket)
- A single broadcast hub fanning frames out to every connected client

---

## ✦ System Requirements

```
  Pentium II 266 MHz ............ (or, you know, any browser from this decade)
  64 MB RAM ..................... (a tab will do)
  Go 1.25+ ..................... for the server
  Node 18+ ..................... for the client dev server
  Sound Blaster 16 ............. optional, dial-up noises sold separately
```

---

## ✦ Getting Started

### 1. Boot the backend (port 8080)

```bash
cd backend
go run .
```

Health check: `http://localhost:8080/healthz`

### 2. Boot the frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, pick a name, and you're on the desktop.
Open a second tab (or send a friend the link) to see chat, cursors, and
paint sync live.

### Production build

```bash
cd frontend && npm run build   # outputs frontend/dist
```

The Go server will serve `./public` if you drop the built assets there.

---

## ✦ Built for the Public — Safe by Default

This is a public, multi-user toy, so every untrusted input is guarded:

- **Per-IP connection limit** — caps simultaneous sockets per address
- **Token-bucket rate limiting** — a flood guard for all traffic, plus a
  stricter bucket just for chat messages
- **Input sanitization** — UTF-8 validation, control-character stripping,
  rune-aware length caps on names and messages
- **Paint validation** — hex colors are allow-listed, coordinates clamped
  to `[0,1]`, brush size clamped to a sane range

Abusive clients get silently dropped instead of taking the room down.

---

## ✦ Roadmap

```
[x] Win98 desktop shell (windows, taskbar, Start menu)
[x] Real-time chat + presence + live cursors
[x] Collaborative MS Paint
[ ] Guestbook (persisted server-side)
[ ] Retro atmosphere: boot screen, Web Audio beeps, CRT scanline toggle
[ ] Clippy (canned, rule-based — no paid LLM)
[ ] Minesweeper
```

---

```
  © 1998-2026 OldGenWeb. Best viewed in Netscape Navigator.
  This site is under construction. 🚧
```
