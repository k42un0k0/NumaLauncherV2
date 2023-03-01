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
  IMPORT_OFFICIAL_SKIN_INFO: "IMPORT_OFFICIAL_SKIN_INFO",
  manual: {
    CLOSE: "MANUAL/CLOSE",
    PREVENT_REDIRECT: "MANUAL/PREVENT_REDIRECT",
  },
};

export const RendererChannel = {
  CLOSE_MSA_LOGIN_WINDOW: "CLOSE_MSA_LOGIN_WINDOW",
  LOGIN_MSA: "LOGIN_MSA",
  ON_RUN_MINECRAFT: "ON_RUN_MINECRAFT",
  state: {
    SET_STATE: "STATE/SET_STATE",
  },
};

export const ManualRendererChannel = {
  FIRST: "MANUAL/FIRST",
  DATA: "MANUAL/DATA",
  download: {
    START: "MANUAL/DOWNLOAD/FIRST",
    PROGRESS: "MANUAL/DOWNLOAD/PROGRESS",
    END: "MANUAL/DOWNLOAD/END",
  },
};

export function handleActions(
  reducers: Record<string, (event: IpcMainInvokeEvent, payload: any) => void | Promise<void>>
) {
  ipcMain.handle(MainChannel.state.DISPATCH, (event, action: Action<any>) => {
    return reducers[action.type](event, action.payload);
  });
}
