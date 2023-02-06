import { app, ipcMain } from "electron";
import { mainWindowBuilder } from "./window";
import { config } from "dotenv";
import { MainChannel } from "./utils/channels";
import { openMSALoginWindow } from "./msaLoginWindow";
import axios from "axios";
import { ConfigManager } from "./config/configManager";
import { runMinecraft } from "./runMinecraft";
function bootstrap() {
  config();
  axios.interceptors.response.use(
    (value) => value,
    (e) => {
      console.log(e);
      throw e;
    }
  );
  ConfigManager.INSTANCE.load();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function main() {
  app.whenReady().then(() => {
    bootstrap();
    const mainWindow = mainWindowBuilder({});

    mainWindow.loadFile("build/index.html");
  });

  app.once("window-all-closed", () => app.quit());
  ipcMain.handle(MainChannel.OPEN_MSA_LOGIN_WINDOW, openMSALoginWindow);
  ipcMain.handle(MainChannel.GET_SELECTED_ACCOUNT, function () {
    return ConfigManager.INSTANCE.config.selectedUUID;
  });
  ipcMain.handle(MainChannel.GET_ACCOUNTS, function () {
    return ConfigManager.INSTANCE.config.accounts;
  });
  ipcMain.on(MainChannel.RUN_MINECRAFT, function (event) {
    return runMinecraft(event);
  });
}

main();
