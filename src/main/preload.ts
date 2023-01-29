import { contextBridge, ipcRenderer } from "electron";
import { CloseMsaLoginWindowState, MainPreload } from "../common/preload";
import { AuthAccount } from "./msAccountManager";
import { MainChannel, RendererChannel } from "./utils/channels";

const preload: MainPreload = {
  login: {
    openMSALoginWindow: () =>
      ipcRenderer.invoke(MainChannel.OPEN_MSA_LOGIN_WINDOW),
    onCloseMSALoginWindow: (callback) => {
      ipcRenderer.on(
        RendererChannel.CLOSE_MSA_LOGIN_WINDOW,
        (_, state: CloseMsaLoginWindowState) => callback(state)
      );
      return () =>
        ipcRenderer.off(RendererChannel.CLOSE_MSA_LOGIN_WINDOW, callback);
    },
    onFetchMSAccount: (callback) => {
      ipcRenderer.on(
        RendererChannel.FETCH_MS_ACCOUNT,
        (_, account: AuthAccount) => callback(account)
      );
      return () => ipcRenderer.off(RendererChannel.FETCH_MS_ACCOUNT, callback);
    },
  },
};
contextBridge.exposeInMainWorld("main", preload);
