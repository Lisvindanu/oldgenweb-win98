// Tiny Web Audio synth for retro system beeps — no audio files, no network.
// All sounds are generated from oscillators so the bundle stays tiny.

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Browsers suspend the context until a user gesture; resume on demand.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Note = { freq: number; start: number; dur: number; type?: OscillatorType };

function play(notes: Note[], gain = 0.06) {
  if (muted) return;
  const context = ac();
  if (!context) return;
  const now = context.currentTime;
  for (const n of notes) {
    const osc = context.createOscillator();
    const g = context.createGain();
    osc.type = n.type ?? "square";
    osc.frequency.value = n.freq;
    g.gain.setValueAtTime(0, now + n.start);
    g.gain.linearRampToValueAtTime(gain, now + n.start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);
    osc.connect(g).connect(context.destination);
    osc.start(now + n.start);
    osc.stop(now + n.start + n.dur);
  }
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

// The classic ascending Windows-ish startup chime.
export function playStartup() {
  play(
    [
      { freq: 523, start: 0, dur: 0.18, type: "triangle" },
      { freq: 659, start: 0.16, dur: 0.18, type: "triangle" },
      { freq: 784, start: 0.32, dur: 0.18, type: "triangle" },
      { freq: 1047, start: 0.48, dur: 0.4, type: "triangle" },
    ],
    0.08,
  );
}

export function playClick() {
  play([{ freq: 660, start: 0, dur: 0.05 }], 0.04);
}

export function playDing() {
  play([{ freq: 880, start: 0, dur: 0.12, type: "sine" }], 0.05);
}
