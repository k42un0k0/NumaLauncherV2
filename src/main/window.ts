import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { preloadPath } from "./utils/path";

interface WindowBuilder {
  (options: BrowserWindowConstructorOptions): BrowserWindow;
}

const defaultOptions = {
  webPreferences: {
    preload: preloadPath,
  },
};
export const mainWindowBuilder: WindowBuilder = (
  options: BrowserWindowConstructorOptions
) => {
  return new BrowserWindow({
    ...defaultOptions,
    ...options,
  });
};
