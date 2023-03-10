import fs from "fs-extra";
import { Config, configArgs } from "../entities/config/config";
import { AuthAccount } from "../entities/config/msAccount";
import { RendererChannel } from "../utils/channels";
import { mergeNonNullishValue, plainToClass } from "../utils/object";
import { paths } from "../utils/paths";
import { broadcast } from "../utils/util";
import { ToPlain } from "../utils/object";

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
  firstLoad: boolean;
  config: Config;
  constructor() {
    this.config = Config.default();
    this.firstLoad = true;
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
    broadcast(RendererChannel.state.SET_STATE);
  }

  load() {
    if (!fs.existsSync(paths.launcher.configFile)) {
      // Create all parent directories.
      fs.ensureDirSync(paths.launcher.$path);
      this.save();
      return;
    }
    let config: ToPlain<Config> = Config.default();
    try {
      config = JSON.parse(fs.readFileSync(paths.launcher.configFile, "utf-8"));
    } catch (err) {
      fs.ensureDirSync(paths.launcher.$path);
      this.save();
      return;
    }

    const def = {
      cls: Config,
      args: configArgs,
    };
    this.config = mergeNonNullishValue(this.config, plainToClass(def, config));
    this.firstLoad = false;
    this.save();
  }
}
