import { AuthAccount } from "../main/config/msAccount";

export type OpenMsaLoginWindowState = "success" | "already";
export type CloseMsaLoginWindowState = "success" | "failure";

interface Server {
  icon?: string;
  id: string;
  description: string;
  version: string;
  minecraftVersion: string;
  mainServer: boolean;
}

export type ViewState = {
  overlay: {
    selectedServer: string;
    servers: Server[];
  };
  landing: {
    account?: AuthAccount;
  };
  setting: {
    account: {
      selectedUUID: string;
      accounts: Record<string, AuthAccount>;
    };
  };
};
