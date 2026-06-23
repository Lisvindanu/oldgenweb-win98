import { useState } from "react";
import { Desktop } from "./desktop/Desktop";
import { NameGate } from "./NameGate";
import { BootScreen } from "./BootScreen";
import { CrtOverlay } from "./CrtOverlay";
import { playStartup, setMuted } from "./lib/sound";

const read = (key: string, fallback: boolean) => {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === "1";
};

export default function App() {
  const [booted, setBooted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [crtOn, setCrtOn] = useState(() => read("crt", false));
  const [muted, setMutedState] = useState(() => read("muted", false));

  // Apply the persisted mute setting to the sound module on first render.
  setMuted(muted);

  const handleBootDone = () => {
    setBooted(true);
    playStartup();
  };

  const toggleCrt = () => {
    setCrtOn((on) => {
      const next = !on;
      localStorage.setItem("crt", next ? "1" : "0");
      return next;
    });
  };

  const toggleMute = () => {
    setMutedState((m) => {
      const next = !m;
      setMuted(next);
      localStorage.setItem("muted", next ? "1" : "0");
      return next;
    });
  };

  return (
    <>
      {booted && (
        <Desktop
          crtOn={crtOn}
          muted={muted}
          onToggleCrt={toggleCrt}
          onToggleMute={toggleMute}
        />
      )}
      {booted && !loggedIn && <NameGate onDone={() => setLoggedIn(true)} />}
      {crtOn && <CrtOverlay />}
      {!booted && <BootScreen onDone={handleBootDone} />}
    </>
  );
}
