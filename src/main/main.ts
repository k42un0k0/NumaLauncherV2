import { app, BrowserWindow, ipcMain } from "electron";
import { config } from "dotenv";
import { handleActions, MainChannel } from "./utils/channels";
import axios from "axios";
import { ConfigManager } from "./config/configManager";
import { runMinecraft } from "./runMinecraft";
import { DistroManager } from "./distribution/distroManager";
import { mainWindowBuilder } from "./window/main";
import { MSAWindowManager } from "./window/msaLogin";
import { ViewState } from "../common/types";
import { actions, PayloadFromActionCreator } from "../common/actions";
function bootstrap() {
  config();
  axios.interceptors.response.use(
    (value) => value,
    (e) => {
      console.log(e);
      throw e;
    }
  );
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

  ipcMain.on(MainChannel.window.CLOSE, function () {
    BrowserWindow.getFocusedWindow()?.close();
  });
  ipcMain.on(MainChannel.window.MINIMIZE, function () {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });
  ipcMain.on(MainChannel.window.MAXIMIZE, function () {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
      win?.unmaximize();
      return;
    }
    win?.maximize();
  });
  ipcMain.handle(MainChannel.config.LOAD, function () {
    return ConfigManager.INSTANCE.load();
  });

  ipcMain.handle(MainChannel.distribution.LOAD, function () {
    return DistroManager.INSTANCE.load();
  });
  ipcMain.handle(MainChannel.OPEN_MSA_LOGIN_WINDOW, () => {
    const windowManager = MSAWindowManager.INSTANCE;
    if (windowManager.hasWindowInstance()) {
      return "already";
    }
    windowManager.createWindow();
    return "success";
  });
  ipcMain.on(MainChannel.RUN_MINECRAFT, function (event) {
    return runMinecraft(event);
  });
  ipcMain.handle(MainChannel.state.GET_STATE, function (): ViewState {
    return {
      overlay: {
        selectedServer: ConfigManager.INSTANCE.config.selectedServer,
        servers:
          DistroManager.getDistribution()?.servers.map((server) => {
            return {
              icon: server.icon,
              id: server.id,
              description: server.description,
              version: server.version,
              minecraftVersion: server.minecraftVersion,
              mainServer: server.mainServer,
            };
          }) || [],
      },
      landing: {
        account: ConfigManager.INSTANCE.config.accounts[ConfigManager.INSTANCE.config.selectedUUID],
      },
      setting: {
        account: {
          accounts: ConfigManager.INSTANCE.config.accounts,
          selectedUUID: ConfigManager.INSTANCE.config.selectedUUID,
        },
      },
    };
  });

  handleActions({
    [actions.overlay.selectServer.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.overlay.selectServer>
    ) => {
      ConfigManager.INSTANCE.config.selectedServer = payload;
      ConfigManager.INSTANCE.save();
    },
  });
}

main();
