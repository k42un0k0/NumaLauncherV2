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
  config: {
    getSelectedUUID: () => ipcRenderer.invoke(MainChannel.GET_SELECTED_ACCOUNT),
    getAccounts: () => ipcRenderer.invoke(MainChannel.GET_ACCOUNTS),
  },
  home: {
    runMinecraft(cb) {
      ipcRenderer.send(MainChannel.RUN_MINECRAFT);
      const callback = (
        _: Electron.IpcRendererEvent,
        event: string,
        ...args: any[]
      ) => {
        // @ts-expect-error aaaadfa
        cb(event, ...args);
        if (event == "finish")
          ipcRenderer.off(RendererChannel.RUN_MINECRAFT_EMITTER, callback);
      };
      ipcRenderer.on(RendererChannel.RUN_MINECRAFT_EMITTER, callback);
    },
  },
};
contextBridge.exposeInMainWorld("main", preload);
