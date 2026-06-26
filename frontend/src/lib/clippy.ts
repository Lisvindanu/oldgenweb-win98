export type Rule = { keywords: string[]; reply: string };

// Canned, rule-based responses — no LLM, no network. Pure nostalgia.
export const RULES: Rule[] = [
  { keywords: ["letter", "write", "surat", "nulis"], reply: "It looks like you're writing a letter! Would you like help with that?" },
  { keywords: ["paint", "draw", "gambar", "lukis"], reply: "Open Paint (shared) and scribble with friends — every stroke syncs live!" },
  { keywords: ["chat", "talk", "ngobrol", "pesan"], reply: "Pop open Chat to talk to everyone in the room. Very 1998 of you. 💬" },
  { keywords: ["mine", "minesweeper", "ranjau"], reply: "Minesweeper tip: the number on a tile = mines touching it. Right-click to flag!" },
  { keywords: ["guestbook", "sign", "buku tamu"], reply: "Sign the Guestbook so future visitors know you were here. ✍️" },
  { keywords: ["online", "who", "siapa"], reply: "Check 'Who's Online' to see who else is wandering the desktop right now." },
  { keywords: ["crt", "scanline", "retro"], reply: "Toggle the CRT button on the taskbar for that authentic chunky-monitor glow. 📺" },
  { keywords: ["sound", "beep", "suara", "mute"], reply: "Use the 🔊 button on the taskbar to mute or unmute the classic system beeps." },
  { keywords: ["hello", "hi", "hai", "halo", "help", "bantu"], reply: "Hi there! I'm Clippy. Ask me about Chat, Paint, Minesweeper, or the Guestbook!" },
  { keywords: ["bye", "thanks", "makasih", "dadah"], reply: "Anytime! I'll be right here, judging your mouse movements. 📎" },
];

export const TIPS = [
  "Did you know? You can drag any window by its title bar.",
  "Tip: other visitors' cursors are real people moving in real time.",
  "Tip: the Paint canvas is shared — try drawing with a friend!",
  "Tip: minimize windows to the taskbar and click to restore them.",
];

export const GREETING = "It looks like you're using OldGenWeb! Ask me anything, or click a tip below. 📎";

export const FALLBACK =
  "Hmm, I'm just a paperclip from 1998 — try asking about Chat, Paint, Minesweeper, the Guestbook, or CRT mode.";

// respond does a case-insensitive keyword match against the rule set,
// falling back to a canned reply when nothing matches.
export function respond(text: string): string {
  const q = text.toLowerCase();
  const match = RULES.find((r) => r.keywords.some((k) => q.includes(k)));
  return match ? match.reply : FALLBACK;
}
