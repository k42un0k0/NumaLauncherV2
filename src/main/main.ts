import { app } from "electron";
import { mainWindowBuilder } from "./window";

app.whenReady().then(() => {
  const mainWindow = mainWindowBuilder({});

  mainWindow.loadFile("build/index.html");
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
});

app.once("window-all-closed", () => app.quit());
