import { Config } from "./config";
import { GameSetting } from "./gameSetting";
import { JavaSetting } from "./javaSetting";
import { LauncherSetting } from "./launcherSetting";
import { ModSetting } from "./modSetting";
import { AuthAccount } from "./msAccount";

export interface ConfigRepository {
  firstLoad: boolean;
  get(): Config;
  getJavaSetting(): JavaSetting;
  getGameSetting(): GameSetting;
  getLauncherSetting(): LauncherSetting;
  getModsSetting(serverID: string): ModSetting | undefined;
  getSelectedAccount(): AuthAccount;
  createAccount(account: AuthAccount): void;
  save(): void;
  load(): void;
}
