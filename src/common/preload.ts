import { Artifact } from "@/main/distribution/artifact";
import { Action } from "./actions";
import { CloseMsaLoginWindowState, OpenMsaLoginWindowState, RunMinecraftListenr, ViewState } from "./types";

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
  importOfficialSkinInfo: () => Promise<void>;
  runMinecraft: () => Promise<OpenMsaLoginWindowState>;
  onRunMinecraft: (listener: (...args: Parameters<RunMinecraftListenr>) => void) => () => void;
  openMSALoginWindow: () => Promise<OpenMsaLoginWindowState>;
  onCloseMSALoginWindow: (callback: (state: CloseMsaLoginWindowState) => void) => () => void;
  openServerDir: () => void;
};
