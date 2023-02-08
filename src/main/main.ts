import { app } from "electron";
import { config } from "dotenv";
import axios from "axios";
import { mainWindowBuilder } from "./window/main";
import { setListener } from "./listener";
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
  setListener();
}

main();
