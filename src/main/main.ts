import { app, BrowserWindow, dialog, globalShortcut, Menu, MenuItemConstructorOptions } from "electron";
import { config } from "dotenv";
import axios from "axios";
import { mainWindowBuilder } from "./usecases/mainWindow";
import { setListener } from "./adapters";
import { paths } from "./utils/paths";
import fs from "fs-extra";
import { isMac } from "./utils/util";
import { createDependencies } from "./dependencies";
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

function createMenu() {
  // Extend default included application menu to continue support for quit keyboard shortcut
  const applicationSubMenu: MenuItemConstructorOptions = {
    label: "Application",
    submenu: [
      {
        label: "About Application",
        role: "about",
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        role: "quit",
        accelerator: "Command+Q",
      },
    ],
  };
  // Extend default included application menu to continue support for quit keyboard shortcut
  const windowMenu: MenuItemConstructorOptions = {
    label: "Window",
    submenu: [
      {
        role: "reload",
        accelerator: "CmdOrCtrl+R",
      },
    ],
  };

  // New edit menu adds support for text-editing keyboard shortcuts
  const editSubMenu: MenuItemConstructorOptions = {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        role: "undo",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        role: "selectAll",
      },
    ],
  };
  const menuObject = Menu.buildFromTemplate([applicationSubMenu, editSubMenu, windowMenu]);
  Menu.setApplicationMenu(menuObject);
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
    const mainWindow = mainWindowBuilder({});

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
