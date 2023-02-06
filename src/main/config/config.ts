import { JavaSetting, javaSettingArgs } from "./javaSetting";
import { GameSetting, gameSettingArgs } from "./gameSetting";
import { LauncherSetting, launcherSettingArgs } from "./launcherSetting";
import { AuthAccount } from "../msAccountManager";
import { ModSetting, modSettingArgs } from "./modSetting";
import { ToPlain } from "../utils/object";

export const configArgs = [
  "selectedUUID",
  "selectedServer",
  "accounts",
  {
    key: "setting",
    cls: Object,
    args: [
      { key: "java", cls: JavaSetting, args: javaSettingArgs },
      {
        key: "game",
        cls: GameSetting,
        args: gameSettingArgs,
      },
      {
        key: "launcher",
        cls: LauncherSetting,
        args: launcherSettingArgs,
      },
      {
        key: "mods",
        cls: ModSetting,
        args: modSettingArgs,
      },
    ],
  },
];
export class Config {
  static default() {
    return new Config(
      "",
      "",
      {},
      {
        java: JavaSetting.default(),
        game: GameSetting.default(),
        launcher: LauncherSetting.default(),
        mods: [],
      }
    );
  }
  constructor(
    public selectedUUID: string,
    public selectedServer: string,
    public accounts: { [uuid: string]: AuthAccount },
    public setting: { java: JavaSetting; game: GameSetting; launcher: LauncherSetting; mods: ModSetting[] }
  ) {}
}

export type ConfigJSON = ToPlain<Config>;
