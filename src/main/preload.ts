import { contextBridge, ipcRenderer } from "electron";
import { MainPreload } from "../common/preload";
import { CloseMsaLoginWindowState } from "../common/types";
import { MainChannel, RendererChannel } from "./utils/channels";

const preload: MainPreload = {
  window: {
    close() {
      ipcRenderer.send(MainChannel.window.CLOSE);
    },
    minimize() {
      ipcRenderer.send(MainChannel.window.MINIMIZE);
    },
    maximize() {
      ipcRenderer.send(MainChannel.window.MAXIMIZE);
    },
  },
  view: {
    getState: () => ipcRenderer.invoke(MainChannel.state.GET_STATE),
    dispatch: (action) => ipcRenderer.invoke(MainChannel.state.DISPATCH, action),
  },
  config: {
    load: () => ipcRenderer.invoke(MainChannel.config.LOAD),
  },
  distribution: {
    load: () => ipcRenderer.invoke(MainChannel.distribution.LOAD),
  },
  openMSALoginWindow: () => ipcRenderer.invoke(MainChannel.OPEN_MSA_LOGIN_WINDOW),
  onCloseMSALoginWindow: (callback) => {
    ipcRenderer.on(RendererChannel.CLOSE_MSA_LOGIN_WINDOW, (_, state: CloseMsaLoginWindowState) => callback(state));
    return () => ipcRenderer.off(RendererChannel.CLOSE_MSA_LOGIN_WINDOW, callback);
  },
  runMinecraft: () => ipcRenderer.invoke(MainChannel.RUN_MINECRAFT),
};
contextBridge.exposeInMainWorld("main", preload);
