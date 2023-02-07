import { AuthAccount } from "./msAccount";
import fs from "fs-extra";
import { paths } from "../utils/paths";
import { Config, configArgs, ConfigJSON } from "./config";
import { mergeNonNullishValue, plainToClass } from "../utils/object";

export class ConfigManager {
  static getTempNativeFolder(): string {
    return "WCNatives";
  }
  private static instance: ConfigManager;
  static get INSTANCE() {
    if (ConfigManager.instance == null) {
      return (ConfigManager.instance = new ConfigManager());
    }
    return ConfigManager.instance;
  }
  config: Config;
  constructor() {
    this.config = Config.default();
  }
  static getLauncherSetting() {
    return ConfigManager.INSTANCE.config.setting.launcher;
  }
  static getJavaSetting() {
    return ConfigManager.INSTANCE.config.setting.java;
  }
  static getGameSetting() {
    return ConfigManager.INSTANCE.config.setting.game;
  }
  static getModsSetting(serverID: string) {
    return ConfigManager.INSTANCE.config.setting.mods.find((mod) => mod.id === serverID);
  }
  getSelectedAccount() {
    return this.config.accounts[this.config.selectedUUID];
  }

  createAccount(account: AuthAccount) {
    this.config.selectedUUID = account.uuid;
    this.config.accounts[account.uuid] = account;
    this.save();
  }
  save() {
    fs.writeFileSync(paths.launcher.configFile, JSON.stringify(this.config, null, 4), "utf-8");
  }

  load() {
    if (!fs.existsSync(paths.launcher.configFile)) {
      console.log("hello");
      // Create all parent directories.
      fs.ensureDirSync(paths.launcher.$path);
      this.config = Config.default();
      this.save();
      return;
    }
    let config: ConfigJSON = Config.default();
    try {
      config = JSON.parse(fs.readFileSync(paths.launcher.configFile, "utf-8"));
    } catch (err) {
      console.log(err);
      fs.ensureDirSync(paths.launcher.$path);
      this.config = Config.default();
      this.save();
      return;
    }

    const def = {
      cls: Config,
      args: configArgs,
    };
    this.config = mergeNonNullishValue(this.config, plainToClass(def, config));
    this.save();
  }
}
