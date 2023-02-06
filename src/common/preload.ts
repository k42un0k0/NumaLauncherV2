import { AuthAccount } from "../main/msAccountManager";

export type OpenMsaLoginWindowState = "success" | "already";
export type CloseMsaLoginWindowState = "success" | "failure";

export type MainPreload = {
  window: {
    close: () => void;
    minimize: () => void;
    maximize: () => void;
  };
  login: {
    openMSALoginWindow: () => Promise<OpenMsaLoginWindowState>;
    onCloseMSALoginWindow: (callback: (state: CloseMsaLoginWindowState) => void) => () => void;
    onFetchMSAccount: (callback: (state: AuthAccount) => void) => () => void;
  };
  config: {
    getSelectedUUID: () => Promise<string>;
    getAccounts: () => Promise<Record<string, AuthAccount>>;
  };
  home: {
    runMinecraft(cb: (...args: ["progress", { progress: number; totalSize: number }]) => void): void;
  };
};
