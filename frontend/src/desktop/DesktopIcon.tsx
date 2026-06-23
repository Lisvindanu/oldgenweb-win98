import { useState } from "react";

type Props = {
  icon: string;
  label: string;
  onOpen: () => void;
};

export function DesktopIcon({ icon, label, onOpen }: Props) {
  const [selected, setSelected] = useState(false);

  return (
    <button
      onClick={() => setSelected(true)}
      onDoubleClick={onOpen}
      onBlur={() => setSelected(false)}
      style={{
        all: "unset",
        cursor: "pointer",
        width: 84,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: 6,
        textAlign: "center",
      }}
    >
      <img
        src={icon}
        alt=""
        width={32}
        height={32}
        style={{ imageRendering: "pixelated", filter: selected ? "brightness(0.7)" : "none" }}
        draggable={false}
      />
      <span
        style={{
          color: "white",
          fontSize: 12,
          padding: "1px 3px",
          background: selected ? "#000080" : "transparent",
          outline: selected ? "1px dotted white" : "none",
          textShadow: selected ? "none" : "1px 1px 1px rgba(0,0,0,0.8)",
          userSelect: "none",
        }}
      >
        {label}
      </span>
    </button>
  );
}
