import { Artifact } from "@/main/entities/distribution/artifact";
import { AuthAccount } from "../main/entities/config/msAccount";

export type OpenMsaLoginWindowState = "success" | "already";
export type CloseMsaLoginWindowState = "success" | "failure";
export type LoginMSAState = "success" | "failure";

export type ViewState = {
  firstLaunch: boolean;
  account?: AuthAccount;
  overlay: {
    selectedServer: string;
    servers: Server[];
  };
  landing: {
    server?: Server;
  };
  setting: {
    account: {
      selectedUUID: string;
      accounts: Record<string, AuthAccount>;
    };
    minecraft: {
      resWidth: number;
      resHeight: number;
      fullscreen: boolean;
      autoConnect: boolean;
      optionStandize: boolean;
    };
    java: {
      minRAM: number;
      maxRAM: number;
      executable: string;
      jvmOptionValue: string;
    };
    launcher: {
      allowPrerelease: boolean;
      dataDirectory: string;
    };
    mod: {
      required: Module[];
      option: Module[];
      selectedServer: string;
    };
  };
};
export type Module = {
  value: boolean;
  name: string;
  version: string;
  versionlessID: string;
  subModules?: {
    required: Module[];
    option: Module[];
  };
};
export interface Server {
  name: string;
  icon?: string;
  id: string;
  description: string;
  version: string;
  minecraftVersion: string;
  mainServer: boolean;
}
export type RunMinecraftListenr =
  | ((type: "validate", payload: "assets" | "libraries" | "files" | "version" | "distribution" | "forge") => void)
  | ((type: "progress", payload: { type: "assets" | "download"; progress: number; total: number }) => void)
  | ((type: "complete", payload: "download" | "install") => void)
  | ((type: "close", payload: Artifact[] | undefined) => void)
  | ((type: "error", payload: any) => void);
