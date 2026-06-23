import { MenuList, MenuListItem, Separator } from "react95";
import { APPS } from "../apps/registry";

type Props = {
  onLaunch: (appId: string) => void;
  onClose: () => void;
};

export function StartMenu({ onLaunch, onClose }: Props) {
  return (
    <MenuList
      style={{
        position: "absolute",
        left: 2,
        bottom: 38,
        zIndex: 9999,
        width: 200,
      }}
      onClick={onClose}
    >
      {APPS.map((app) => (
        <MenuListItem key={app.id} onClick={() => onLaunch(app.id)}>
          <img src={app.icon} alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
          <span style={{ marginLeft: 8 }}>{app.title.replace("C:\\", "")}</span>
        </MenuListItem>
      ))}
      <Separator />
      <MenuListItem disabled>
        <span style={{ marginLeft: 28 }}>Shut Down…</span>
      </MenuListItem>
    </MenuList>
  );
}
