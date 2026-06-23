import type { ComponentType } from "react";
import { ChatApp } from "./ChatApp";
import { OnlineApp } from "./OnlineApp";
import { AboutApp } from "./AboutApp";
import { PaintApp } from "./PaintApp";
import { GuestbookApp } from "./GuestbookApp";
import { MinesweeperApp } from "./MinesweeperApp";
import { ClippyApp } from "./ClippyApp";

export type AppDef = {
  id: string;
  title: string;
  icon: string;
  component: ComponentType;
  width: number;
  height: number;
};

export const APPS: AppDef[] = [
  { id: "chat", title: "C:\\Chat", icon: "/icons/chat.png", component: ChatApp, width: 460, height: 380 },
  { id: "paint", title: "Paint (shared)", icon: "/icons/paint.png", component: PaintApp, width: 600, height: 480 },
  { id: "minesweeper", title: "Minesweeper", icon: "/icons/mine.png", component: MinesweeperApp, width: 280, height: 360 },
  { id: "guestbook", title: "Guestbook", icon: "/icons/guestbook.png", component: GuestbookApp, width: 420, height: 420 },
  { id: "clippy", title: "Clippy", icon: "/icons/clippy.png", component: ClippyApp, width: 380, height: 420 },
  { id: "online", title: "Who's Online", icon: "/icons/users.png", component: OnlineApp, width: 280, height: 320 },
  { id: "about", title: "About OldGenWeb", icon: "/icons/info.png", component: AboutApp, width: 420, height: 340 },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
