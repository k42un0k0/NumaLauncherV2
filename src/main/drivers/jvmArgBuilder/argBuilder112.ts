import path from "path";
import { Server } from "../../entities/distribution/server";
import { ForgeData112 } from "../../entities/versionManifest/forgeData112";
import { AuthAccount } from "../../entities/config/msAccount";
import { _lteMinorVersion } from "../../utils/util";
import { VersionData112 } from "../../entities/versionManifest/versionData112";
import { VersionData113 } from "../../entities/versionManifest/versionData113";
import { replaceJVMArgument, _processAutoConnectArg } from "./helper";
import { ConfigManager } from "../configManager";

export class ArgBuilder112 {
  static genValueAfterReplace(
    authUser: AuthAccount,
    server: Server,
    gameDir: string,
    versionData: VersionData112 | VersionData113
  ): (value: string) => Record<string, string> {
    return (_) => {
      return {
        auth_player_name: authUser.displayName.trim(),
        version_name: server.id,
        game_directory: gameDir,
        assets_root: ConfigManager.getLauncherSetting().getDataDirectory().common.assets.$path,
        assets_index_name: versionData.assets,
        auth_uuid: authUser.uuid.trim(),
        auth_access_token: authUser.accessToken,
        user_type: "mojang",
        user_properties: "{}", // 1.8.9 and below.
        version_type: versionData.type,
      };
    };
  }
  static build(
    tempNativePath: string,
    forgeData: ForgeData112,
    server: Server,
    fmlDir: string,
    llDir: string,
    usingLiteLoader: boolean,
    valueAfterReplace: (value: string) => Record<string, string>,
    classpath: string
  ) {
    let args: string[] = [];

    // Classpath Argument
    args.push("-cp");
    args.push(classpath);

    args.push("-Dlog4j2.formatMsgNoLookups=true");

    // Java Arguments
    if (process.platform === "darwin") {
      args.push("-Xdock:name=NumaLauncher");
      args.push("-Xdock:icon=" + path.join(__dirname, "..", "images", "minecraft.icns"));
    }
    args.push("-Xmx" + ConfigManager.getJavaSetting().maxRAM);
    args.push("-Xms" + ConfigManager.getJavaSetting().minRAM);
    args = args.concat(ConfigManager.getJavaSetting().jvmOptions);
    args.push("-Djava.library.path=" + tempNativePath);

    // Main Java Class
    args.push(forgeData.mainClass);

    // Forge Arguments
    let mcArgs = forgeData.minecraftArguments.split(" ");

    // Replace the declared variables with their proper values.
    for (let i = 0; i < mcArgs.length; ++i) {
      mcArgs = mcArgs.map((value) => {
        return replaceJVMArgument(value, valueAfterReplace);
      });
    }

    // Autoconnect to the selected server.
    mcArgs = mcArgs.concat(_processAutoConnectArg(server));

    // Prepare game resolution
    if (ConfigManager.getGameSetting().fullscreen) {
      mcArgs.push("--fullscreen");
      // TODO: 実装変えた true -> (true).toString()
      mcArgs.push(true.toString());
    } else {
      mcArgs.push("--width");
      // TODO: 実装変えた ConfigManager.getGameWidth() -> ConfigManager.getGameWidth().toString()
      mcArgs.push(ConfigManager.getGameSetting().resWidth.toString());
      mcArgs.push("--height");
      // TODO: 実装変えた ConfigManager.getGameHeight() -> ConfigManager.getGameHeight().toString()
      mcArgs.push(ConfigManager.getGameSetting().resHeight.toString());
    }

    // Mod List File Argument
    mcArgs.push("--modListFile");
    if (_lteMinorVersion(forgeData, 9)) {
      mcArgs.push(path.basename(fmlDir));
    } else {
      mcArgs.push("absolute:" + fmlDir);
    }

    // LiteLoader
    if (usingLiteLoader) {
      mcArgs.push("--modRepo");
      mcArgs.push(llDir);

      // Set first arg to liteloader tweak class
      mcArgs.unshift("com.mumfrey.liteloader.launch.LiteLoaderTweaker");
      mcArgs.unshift("--tweakClass");
    }

    args = args.concat(mcArgs);

    return args;
  }
}
