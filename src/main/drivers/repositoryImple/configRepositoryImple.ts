import { AuthAccount } from "../../entities/config/msAccount";
import { ConfigRepository } from "@/main/entities/config/configRepository";
import { ConfigManager } from "../configManager";
import { Config } from "@/main/entities/config/config";
import { GameSetting } from "@/main/entities/config/gameSetting";
import { JavaSetting } from "@/main/entities/config/javaSetting";
import { LauncherSetting } from "@/main/entities/config/launcherSetting";
import { ModSetting } from "@/main/entities/config/modSetting";

export class ConfigRepositoryImple implements ConfigRepository {
  get firstLoad() {
    return ConfigManager.INSTANCE.firstLoad;
  }
  getJavaSetting(): JavaSetting {
    return ConfigManager.getJavaSetting();
  }
  getGameSetting(): GameSetting {
    return ConfigManager.getGameSetting();
  }
  getLauncherSetting(): LauncherSetting {
    return ConfigManager.getLauncherSetting();
  }
  getModsSetting(serverID: string): ModSetting | undefined {
    return ConfigManager.getModsSetting(serverID);
  }
  get(): Config {
    return ConfigManager.INSTANCE.config;
  }
  getSelectedAccount(): AuthAccount {
    return ConfigManager.INSTANCE.getSelectedAccount();
  }
  createAccount(account: AuthAccount): void {
    ConfigManager.INSTANCE.createAccount(account);
  }
  save(): void {
    ConfigManager.INSTANCE.save();
  }
  load(): void {
    ConfigManager.INSTANCE.load();
  }
}
