import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { getPlatformIcon } from "@/assets/ts";
import { SealCircleSet } from "@/assets/ts/main";
import { paths } from "../utils/paths";
import { shell } from "electron";
interface WindowBuilder {
  (options: BrowserWindowConstructorOptions): BrowserWindow;
}

const defaultOptions = {
  width: 980,
  height: 552,
  icon: getPlatformIcon(SealCircleSet),
  webPreferences: {
    preload: paths.preloadFile,
  },
  frame: false,
  backgroundColor: "#171614",
};
export const mainWindowBuilder: WindowBuilder = (options: BrowserWindowConstructorOptions) => {
  const win = new BrowserWindow({
    ...defaultOptions,
    ...options,
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (url.match(/^http/)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler((e) => {
    if (e.url.match(/^http/)) {
      shell.openExternal(e.url);
    }
    return { action: "deny" };
  });
  return win;
};
