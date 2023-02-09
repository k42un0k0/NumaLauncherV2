import { BrowserWindow, ipcMain, shell } from "electron";
import { handleActions, MainChannel } from "./utils/channels";
import { ConfigManager } from "./config/configManager";
import { runMinecraft } from "./runMinecraft";
import { DistroManager } from "./distribution/distroManager";
import { MSAWindowManager } from "./window/msaLogin";
import { ViewState } from "../common/types";
import { actions, PayloadFromActionCreator } from "../common/actions";
import fs from "fs-extra";

export function setListener() {
  windowListener();
  loadListener();
  globalListener();
  viewListener();
}
function viewListener() {
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
        minecraft: {
          resWidth: ConfigManager.getGameSetting().resWidth,
          resHeight: ConfigManager.getGameSetting().resHeight,
          fullscreen: ConfigManager.getGameSetting().fullscreen,
          autoConnect: ConfigManager.getGameSetting().autoConnect,
          optionStandize: ConfigManager.getLauncherSetting().optionStandardize,
        },
        java: {
          minRAM: Number(ConfigManager.getJavaSetting().minRAM.replace("G", "")),
          maxRAM: Number(ConfigManager.getJavaSetting().maxRAM.replace("G", "")),
          executable: ConfigManager.getJavaSetting().executable,
          jvmOptionValue: ConfigManager.getJavaSetting().jvmOptions.join(" "),
        },
        launcher: {
          dataDirectory: ConfigManager.getLauncherSetting().dataDirectory,
          allowPrerelease: ConfigManager.getLauncherSetting().allowPrerelease,
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
    [actions.setting.java.setExecutable.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setExecutable>
    ) => {
      ConfigManager.getJavaSetting().executable = payload;
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setMinRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMinRAM>
    ) => {
      ConfigManager.getJavaSetting().minRAM = payload + "G";
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setMaxRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMaxRAM>
    ) => {
      ConfigManager.getJavaSetting().maxRAM = payload + "G";
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setJvmOptions.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setJvmOptions>
    ) => {
      ConfigManager.getJavaSetting().jvmOptions = payload.split(" ");
      ConfigManager.INSTANCE.save();
    },
  });
}

function globalListener() {
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
  ipcMain.on(MainChannel.OPEN_SERVER_DIR, function () {
    const serv = DistroManager.getDistribution()!.getServer(ConfigManager.INSTANCE.config.selectedServer);
    const CACHE_SETTINGS_MODS_DIR = ConfigManager.getLauncherSetting().getDataDirectory().instances.$join(serv!.id);
    fs.ensureDirSync(CACHE_SETTINGS_MODS_DIR);
    shell.openPath(CACHE_SETTINGS_MODS_DIR);
  });
}

function loadListener() {
  ipcMain.handle(MainChannel.config.LOAD, function () {
    return ConfigManager.INSTANCE.load();
  });

  ipcMain.handle(MainChannel.distribution.LOAD, function () {
    return DistroManager.INSTANCE.load();
  });
}

function windowListener() {
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
}
