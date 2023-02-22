import { Artifact } from "@/main/distribution/artifact";
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
  importOfficialSkinInfo: () => Promise<void>;
  runMinecraft: () => Promise<OpenMsaLoginWindowState>;
  onRunMinecraft: (listener: (...args: Parameters<RunMinecraftListenr>) => void) => () => void;
  openMSALoginWindow: () => Promise<OpenMsaLoginWindowState>;
  onCloseMSALoginWindow: (callback: (state: CloseMsaLoginWindowState) => void) => () => void;
  openServerDir: () => void;
};

type RunMinecraftListenr =
  | ((type: "validate", payload: "assets" | "libraries" | "files" | "version" | "distribution" | "forge") => void)
  | ((type: "progress", payload: { type: "assets" | "download"; progress: number; total: number }) => void)
  | ((type: "complete", payload: "download" | "install") => void)
  | ((type: "close", payload: Artifact[] | undefined) => void)
  | ((type: "error", payload: any) => void);
