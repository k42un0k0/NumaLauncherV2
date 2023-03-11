import { app, BrowserWindow, dialog, globalShortcut } from "electron";
import { config } from "dotenv";
import axios from "axios";
import { setListener } from "./drivers/lisntener";
import { paths } from "./utils/paths";
import fs from "fs-extra";
import { isMac } from "./utils/util";
import { createDependencies } from "./dependencies";
import { createMenu } from "./menu";
import { createMainWindow } from "./drivers/mainWindow";
function bootstrap() {
  config();
  axios.interceptors.response.use(
    (value) => value,
    (e) => {
      console.log(e);
      throw e;
    }
  );
  process.on("uncaughtException", (err) => {
    const messageBoxOptions = {
      type: "error",
      title: "エラー",
      message: "エラーが起きました\nエラーが起きた時の状況をLab勢に説明してください",
    };
    dialog.showMessageBoxSync(messageBoxOptions);
    // I believe it used to be the case that doing a "throw err;" here would
    // terminate the process, but now it appears that you have to use's Electron's
    // app module to exit (process.exit(1) seems to not terminate the process)
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function main() {
  app.whenReady().then(async () => {
    bootstrap();
    if (isMac) {
      createMenu();
    }
    globalShortcut.register("Alt+CommandOrControl+I", () => {
      BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools();
    });
    const mainWindow = createMainWindow({});

    mainWindow.loadFile("build/index.html");
  });

  app.once("window-all-closed", () => app.quit());
  app.on("quit", () => {
    // tmpディレクトリお掃除
    fs.removeSync(paths.manualDownloads.$path);
  });
  const deps = createDependencies();
  setListener(deps);
}

main();
