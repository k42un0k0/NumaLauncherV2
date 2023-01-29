import { BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { fetchMSAccount } from "./msAccountManager";
import { RendererChannel } from "./utils/channels";

const redirectUriPrefix =
  "https://login.microsoftonline.com/common/oauth2/nativeclient?";

class MSAWindowManager {
  private static instance?: MSAWindowManager;
  static get INSTANCE() {
    if (MSAWindowManager.instance != null) return MSAWindowManager.instance;
    return (MSAWindowManager.instance = new MSAWindowManager());
  }

  private windowInstance?: BrowserWindow;
  private loginSuccessful = false;

  hasWindowInstance() {
    return !!this.windowInstance;
  }
  createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      title: "Microsoft Login",
      backgroundColor: "#222222",
      width: 520,
      height: 600,
      frame: true,
      autoHideMenuBar: true,
    });
    this.windowInstance = win;
    return win;
  }
  clear() {
    this.windowInstance = undefined;
    this.loginSuccessful = false;
  }
  successLogin() {
    this.loginSuccessful = true;
  }
  closeMSALoginWindowState() {
    return this.loginSuccessful ? "success" : "failure";
  }
}

function redirectUriToQuery(uri: string): Map<string, string> {
  const querys = uri
    .substring(redirectUriPrefix.length)
    .split("#", 1)
    .toString()
    .split("&");
  const queryMap = new Map();

  querys.forEach((query) => {
    const arr = query.split("=");
    queryMap.set(arr[0], decodeURI(arr[1]));
  });
  return queryMap;
}
export async function openMSALoginWindow(event: Electron.IpcMainInvokeEvent) {
  const windowManager = MSAWindowManager.INSTANCE;
  if (windowManager.hasWindowInstance()) {
    return "already";
  }

  const win = windowManager.createWindow();
  win.loadURL(
    `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=select_account&client_id=${process.env.CLIENT_ID}&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient`
  );

  win.on("closed", () => {
    event.sender.send(
      RendererChannel.CLOSE_MSA_LOGIN_WINDOW,
      windowManager.closeMSALoginWindowState()
    );
    windowManager.clear();
  });

  win.webContents.on("did-navigate", async (_, uri) => {
    if (uri.startsWith(redirectUriPrefix)) {
      const queryMap = redirectUriToQuery(uri);
      const authCode = queryMap.get("code");
      if (authCode == null) {
        win.close();
        return;
      }
      windowManager.successLogin();

      win.close();
      const authAcount = await fetchMSAccount(authCode);
      event.sender.send(RendererChannel.FETCH_MS_ACCOUNT, authAcount);
    }
  });

  return "success";
}
