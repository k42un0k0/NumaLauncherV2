import { Action } from "./actions";
import { CloseMsaLoginWindowState, OpenMsaLoginWindowState, ViewState } from "./types";

export type MainPreload = {
  window: {
    close: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  view: {
    getState(): Promise<ViewState>;
    dispatch(action: Action<unknown>): Promise<void>;
  };
  config: {
    load: () => Promise<void>;
  };
  distribution: {
    load: () => Promise<void>;
  };
  runMinecraft: () => Promise<OpenMsaLoginWindowState>;
  openMSALoginWindow: () => Promise<OpenMsaLoginWindowState>;
  onCloseMSALoginWindow: (callback: (state: CloseMsaLoginWindowState) => void) => () => void;
  openServerDir: () => void;
};
