import { Action } from "./actions";
import {
  CloseMsaLoginWindowState,
  LoginMSAState,
  OpenMsaLoginWindowState,
  RunMinecraftListenr,
  ViewState,
} from "./types";

export type MainPreload = {
  onLoginMsa(callback: (state: LoginMSAState) => void): () => void;
  window: {
    close: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  view: {
    getState(): Promise<ViewState>;
    setState(setState: () => void): () => void;
    dispatch(action: Action<unknown>): Promise<void>;
  };
  config: {
    load: () => Promise<void>;
  };
  distribution: {
    load: () => Promise<void>;
  };
  importOfficialSkinInfo: () => Promise<void>;
  runMinecraft: () => Promise<OpenMsaLoginWindowState>;
  onRunMinecraft: (listener: (...args: Parameters<RunMinecraftListenr>) => void) => () => void;
  openMSALoginWindow: () => Promise<OpenMsaLoginWindowState>;
  onCloseMSALoginWindow: (callback: (state: CloseMsaLoginWindowState) => void) => () => void;
  openServerDir: () => void;
};
