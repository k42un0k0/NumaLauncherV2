import { app, ipcMain } from "electron";
import { mainWindowBuilder } from "./window";
import { config } from "dotenv";
import { MainChannel } from "./utils/channels";
import { openMSALoginWindow } from "./msaLoginWindow";
config();

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function main() {
  app.whenReady().then(() => {
    const mainWindow = mainWindowBuilder({});

    mainWindow.loadFile("build/index.html");
  });

  app.once("window-all-closed", () => app.quit());
  ipcMain.handle(MainChannel.OPEN_MSA_LOGIN_WINDOW, openMSALoginWindow);
}

main();
