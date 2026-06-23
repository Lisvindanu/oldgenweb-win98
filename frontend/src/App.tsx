import { useState } from "react";
import { Desktop } from "./desktop/Desktop";
import { NameGate } from "./NameGate";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      <Desktop />
      {!loggedIn && <NameGate onDone={() => setLoggedIn(true)} />}
    </>
  );
}
