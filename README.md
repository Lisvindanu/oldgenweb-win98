<!-- ============================================================ -->
<!--   OldGenWeb — Win98 Edition  ::  best viewed in 800x600      -->
<!-- ============================================================ -->

<div align="center">

<pre>
 ____________________________________________________________
|  OldGenWeb                                    [_] [▫] [X]   |
|============================================================|
|                                                            |
|     W E L C O M E   T O   T H E   W O R L D   W I D E       |
|              W E B  ,   c i r c a   1 9 9 8                 |
|              . . . r u n n i n g   o n   2 0 2 6            |
|                                                            |
|   [ Chat ]   [ Paint ]   [ Who's Online ]   [ About ]      |
|____________________________________________________________|
|  Start  |                                  ☼  12:00 PM      |
|____________________________________________________________|
</pre>

<h1>🖥️ OldGenWeb — <i>Win98 Edition</i></h1>

<b>Tampilan jadul, kemampuan 2026.</b><br>
<sub>A Windows 98 desktop that lives in your browser — wired to a real-time backend so everyone shares the same room.</sub>

<br><br>

<img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
<img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white">
<img alt="Go" src="https://img.shields.io/badge/Go-1.25-00ADD8?style=flat-square&logo=go&logoColor=white">
<img alt="WebSocket" src="https://img.shields.io/badge/WebSocket-live-880000?style=flat-square">
<img alt="Status" src="https://img.shields.io/badge/under-construction-FFD700?style=flat-square">

</div>

<hr>

<h2>✦ Features</h2>

<table>
<thead>
<tr><th>App</th><th>What it does</th></tr>
</thead>
<tbody>
<tr><td>💬 <b>Chat</b></td><td>MSN/mIRC-style live chat, broadcast to everyone in the room</td></tr>
<tr><td>👥 <b>Who's Online</b></td><td>Live presence list — see who just walked in</td></tr>
<tr><td>🖱️ <b>Live Cursors</b></td><td>Other visitors' mouse pointers glide across your desktop in real time</td></tr>
<tr><td>🎨 <b>Paint (shared)</b></td><td>Collaborative MS Paint — every stroke is broadcast to all painters</td></tr>
</tbody>
</table>

<p>All windows are draggable, minimizable, and stack with real z-ordering — just like the real thing.</p>

<hr>

<h2>✦ Tech Stack</h2>

<table>
<tr>
<td valign="top" width="50%">

<b>🪟 Frontend</b>
<ul>
<li>React 19 + Vite + TypeScript</li>
<li><a href="https://react95.io/">react95</a> — authentic Win98 component kit</li>
<li>styled-components</li>
<li>Native WebSocket client w/ auto-reconnect</li>
</ul>

</td>
<td valign="top" width="50%">

<b>⚙️ Backend</b>
<ul>
<li>Go 1.25 — <samp>module oldgenweb/backend</samp></li>
<li><a href="https://github.com/gorilla/websocket">gorilla/websocket</a></li>
<li>Single broadcast hub fanning frames to every client</li>
</ul>

</td>
</tr>
</table>

<hr>

<h2>✦ System Requirements</h2>

<pre>
  Pentium II 266 MHz ........ or any browser from this decade
  64 MB RAM ................. a single tab will do
  Go 1.25+ ................. for the server
  Node 18+ ................. for the client dev server
  Sound Blaster 16 ......... optional; dial-up noises sold separately
</pre>

<hr>

<h2>✦ Getting Started</h2>

<h4>1. Boot the backend <kbd>port 8080</kbd></h4>

```bash
cd backend
go run .
```

<sub>Health check: <samp>http://localhost:8080/healthz</samp></sub>

<h4>2. Boot the frontend <kbd>port 5173</kbd></h4>

```bash
cd frontend
npm install
npm run dev
```

<p>Open <b>http://localhost:5173</b>, pick a name, and you're on the desktop. Open a second tab (or send a friend the link) to watch chat, cursors, and paint sync live.</p>

<details>
<summary><b>📦 Production build</b></summary>

```bash
cd frontend && npm run build   # outputs frontend/dist
```

The Go server serves <samp>./public</samp> if you drop the built assets there.

</details>

<hr>

<h2>✦ Built for the Public — Safe by Default</h2>

<p>This is a public, multi-user toy, so every untrusted input is guarded:</p>

<table>
<tr><td>🚧 <b>Per-IP connection limit</b></td><td>caps simultaneous sockets per address</td></tr>
<tr><td>🪣 <b>Token-bucket rate limiting</b></td><td>flood guard for all traffic + a stricter bucket just for chat</td></tr>
<tr><td>🧼 <b>Input sanitization</b></td><td>UTF-8 validation, control-char stripping, rune-aware length caps</td></tr>
<tr><td>🎨 <b>Paint validation</b></td><td>hex colors allow-listed, coordinates clamped to <samp>[0,1]</samp>, brush size clamped</td></tr>
</table>

<p><sub>Abusive clients get silently dropped instead of taking the room down.</sub></p>

<hr>

<h2>✦ Roadmap</h2>

<pre>
[x] Win98 desktop shell (windows, taskbar, Start menu)
[x] Real-time chat + presence + live cursors
[x] Collaborative MS Paint
[ ] Guestbook (persisted server-side)
[ ] Retro atmosphere: boot screen, Web Audio beeps, CRT scanline toggle
[ ] Clippy (canned, rule-based — no paid LLM)
[ ] Minesweeper
</pre>

<hr>

<div align="center">

<sub>© 1998–2026 OldGenWeb &nbsp;•&nbsp; Best viewed in Netscape Navigator &nbsp;•&nbsp; 🚧 This site is under construction 🚧</sub>

</div>
