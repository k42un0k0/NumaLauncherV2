import path from "path";
import { genPaths, paths } from "../utils/paths";

export const launcherSettingArgs = ["allowPrerelease", "optionStandardize", "dataDirectory"];
const defaultDataDir = ".numalauncherv2";
export class LauncherSetting {
  static default() {
    return new LauncherSetting(false, true, paths.sysRoot.$join(defaultDataDir));
  }
  constructor(public allowPrerelease: boolean, public optionStandardize: boolean, public dataDirectory: string) {}
  getDataDirectory() {
    return genPaths(
      {
        common: {
          libraries: {},
          modstore: {},
          versions: {
            libraries: {},
          },
          assets: {
            log_configs: {},
            indexes: {},
            objects: {},
          },
        },
        instances: {
          game: function () {
            return {
              forgeModListFile: "forgeMods.list",
              fmlFile: "forgeModList.json",
              llFile: "liteloaderModList.json",
            };
          },
        },
      },
      {
        common: paths.sysRoot.$join(this.dataDirectory, "common"),
        instances: paths.sysRoot.$join(this.dataDirectory, "instances"),
      }
    );
  }
}
