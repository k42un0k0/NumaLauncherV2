import { AuthAccount } from "../main/config/msAccount";

export type OpenMsaLoginWindowState = "success" | "already";
export type CloseMsaLoginWindowState = "success" | "failure";

export type ViewState = {
  overlay: {
    selectedServer: string;
    servers: Server[];
  };
  landing: {
    account?: AuthAccount;
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
