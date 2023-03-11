import { BrowserWindow } from "electron";
import { MsaLoginOB } from "../../usecases/msaLogin";
import { RendererChannel } from "../../utils/channels";
import { broadcast } from "../../utils/util";

export class MsaLoginViewImple implements MsaLoginOB {
  private _win?: BrowserWindow;
  createWindow(
    onClosed: () => "success" | "failure",
    onDidNavigate: (uri: string) => Promise<"success" | "failure">
  ): void {
    this._win = new BrowserWindow({
      title: "Microsoft Login",
      backgroundColor: "#222222",
      width: 520,
      height: 600,
      frame: true,
      autoHideMenuBar: true,
    });
    this._win.loadURL(
      `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=select_account&client_id=${process.env.CLIENT_ID}&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient`
    );
    this._win.on("closed", () => {
      const state = onClosed();
      broadcast(RendererChannel.CLOSE_MSA_LOGIN_WINDOW, state);
    });
    this._win.webContents.on("did-navigate", async (_, uri) => {
      const state = await onDidNavigate(uri);
      broadcast(RendererChannel.LOGIN_MSA, state);
    });
  }

  close(): void {
    this._win?.close();
  }
}
