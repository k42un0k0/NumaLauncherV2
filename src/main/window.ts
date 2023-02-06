import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { getPlatformIcon } from "../assets/ts";
import { SealCircleSet } from "../assets/ts/images";
import { paths } from "./utils/paths";

interface WindowBuilder {
  (options: BrowserWindowConstructorOptions): BrowserWindow;
}

const defaultOptions = {
  icon: getPlatformIcon(SealCircleSet),
  webPreferences: {
    preload: paths.preloadFile,
  },
};
export const mainWindowBuilder: WindowBuilder = (options: BrowserWindowConstructorOptions) => {
  return new BrowserWindow({
    ...defaultOptions,
    ...options,
  });
};
