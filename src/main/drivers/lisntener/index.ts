import { BrowserWindow, ipcMain, shell } from "electron";
import { MainChannel } from "../../utils/channels";
import { DistroManager } from "../distroManager";
import fs from "fs-extra";
import { viewListener } from "./viewListener";
import { ConfigManager } from "../configManager";
import { ManualWindowManager } from "../../usecases/manualWindow";
import { MSAWindowManager } from "../../usecases/msaLogin";
import { Dependencies } from "../../dependencies";
import { RunMinecraftPresenter } from "../../adapters/RunMinecraftPresenter";
import { RunMinecraftViewImple } from "../viewImple/runMinecraftViewImple";
import { MsaLoginViewImple } from "../viewImple/msaLoginViewImple";

export function setListener(deps: Dependencies) {
  windowListener();
  globalListener(deps);
  viewListener(deps);
  msaWindowListener();
  manualWindowListener();
  configListener();
  distroListener();
}

function globalListener(deps: Dependencies) {
  ipcMain.handle(MainChannel.RUN_MINECRAFT, function (event) {
    return deps.runMinecraftInteractor.handle(new RunMinecraftPresenter(new RunMinecraftViewImple(event.sender)));
  });
  ipcMain.on(MainChannel.IMPORT_OFFICIAL_SKIN_INFO, function (event) {
    throw new Error("not implemented");
  });
  ipcMain.on(MainChannel.OPEN_SERVER_DIR, function () {
    const serv = DistroManager.getDistribution()!.getServer(ConfigManager.INSTANCE.config.selectedServer);
    const CACHE_SETTINGS_MODS_DIR = ConfigManager.getLauncherSetting().getDataDirectory().instances.$join(serv!.id);
    fs.ensureDirSync(CACHE_SETTINGS_MODS_DIR);
    shell.openPath(CACHE_SETTINGS_MODS_DIR);
  });
}

function distroListener() {
  ipcMain.handle(MainChannel.distribution.LOAD, function () {
    return DistroManager.INSTANCE.load();
  });
}

function configListener() {
  ipcMain.handle(MainChannel.config.LOAD, function () {
    return ConfigManager.INSTANCE.load();
  });
}

function msaWindowListener(deps: Dependencies) {
  ipcMain.handle(MainChannel.OPEN_MSA_LOGIN_WINDOW, () => {
    return deps.msaLoginInteractor.handle(new MsaLoginViewImple());
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

function manualWindowListener() {
  ipcMain.on(MainChannel.manual.CLOSE, (ipcEvent, index) => {
    // IDを探してウィンドウを閉じる
    const window = ManualWindowManager.INSTANCE.manualWindows[index];
    if (window !== undefined) {
      window.win.close();
      ManualWindowManager.INSTANCE.manualWindows[index] = undefined;
    }
  });
  // IDでウィンドウを閉じる
  ipcMain.on(MainChannel.manual.PREVENT_REDIRECT, (ipcEvent, index, prevent) => {
    // IDを探してリダイレクト可否フラグ変更
    const window = ManualWindowManager.INSTANCE.manualWindows[index];
    if (window !== undefined) {
      window.preventRedirect = prevent;
    }
  });
}
