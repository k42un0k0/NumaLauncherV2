import { Action } from "@/common/actions";
import { ipcMain, IpcMainInvokeEvent } from "electron";

export const MainChannel = {
  window: {
    CLOSE: "WINDOW/CLOSE",
    MAXIMIZE: "WINDOW/MAXIMIZE",
    MINIMIZE: "WINDOW/MINIMIZE",
  },
  state: {
    GET_STATE: "STATE/GET_STATE",
    DISPATCH: "STATE/DISPATCH",
  },
  config: {
    LOAD: "CONFIG/LOAD",
  },
  distribution: {
    LOAD: "DISTRIBUTION/LOAD",
  },
  OPEN_MSA_LOGIN_WINDOW: "OPEN_MSA_LOGIN_WINDOW",
  RUN_MINECRAFT: "RUN_MINECRAFT",
  OPEN_SERVER_DIR: "OPEN_SERVER_DIR",
};

export const RendererChannel = {
  CLOSE_MSA_LOGIN_WINDOW: "WINDOW/CLOSE_MSA_LOGIN_WINDOW",
};

export function handleActions(
  reducers: Record<string, (event: IpcMainInvokeEvent, payload: any) => void | Promise<void>>
) {
  ipcMain.handle(MainChannel.state.DISPATCH, (event, action: Action<any>) => {
    return reducers[action.type](event, action.payload);
  });
}
