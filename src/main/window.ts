import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { getPlatformIcon } from "../assets/ts";
import { SealCircleSet } from "../assets/ts/main";
import { paths } from "./utils/paths";

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
  return new BrowserWindow({
    ...defaultOptions,
    ...options,
  });
};
