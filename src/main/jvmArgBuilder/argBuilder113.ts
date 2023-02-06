import os from "os";
import path from "path";
import { ConfigManager } from "../config/configManager";
import { Server } from "../distribution/classes";
import { ForgeData113 } from "../versionManifest/forgeData113";
import { AuthAccount } from "../msAccountManager";
import { mojangFriendlyOS } from "../utils/util";
import { VersionData113, VersionData113Rules, VersionDataArg } from "../versionManifest/versionData113";
import { argDiscovery, classpathSeparator, replaceJVMArgument, _processAutoConnectArg } from "./helper";

export class ArgBuilder113 {
  static genValueAfterReplace(
    tempNativePath: string,
    versionData: VersionData113,
    authUser: AuthAccount,
    server: Server,
    gameDir: string,
    launcherVersion: string,
    classpath: string
  ): (value: string) => Record<string, string> {
    return (value: string) => {
      return {
        auth_player_name: authUser.displayName.trim(),
        version_name: server.id,
        game_directory: gameDir,
        assets_root: ConfigManager.getLauncherSetting().getDataDirectory().common.assets.$path,
        assets_index_name: versionData.assets,
        auth_uuid: authUser.uuid.trim(),
        auth_access_token: authUser.accessToken,
        user_type: "mojang",
        version_type: versionData.type,
        resolution_width: ConfigManager.getGameSetting().resWidth.toString(),
        resolution_height: ConfigManager.getGameSetting().resHeight.toString(),
        natives_directory: value.replace(argDiscovery, tempNativePath),
        launcher_name: value.replace(argDiscovery, "Numa-Launcher"),
        launcher_version: value.replace(argDiscovery, launcherVersion),
        classpath: classpath,
      };
    };
  }
  static build(
    versionData: VersionData113,
    forgeData: ForgeData113,
    libPath: string,
    server: Server,
    valueAfterReplace: (value: string) => Record<string, string>
  ) {
    const argDiscovery = /\${*(.*)}/;

    // JVM Arguments First
    let args: VersionDataArg[] = versionData.arguments.jvm;

    if (forgeData.arguments.jvm != null) {
      forgeData.arguments.jvm.forEach((element) => {
        args.push(
          element
            .replaceAll("${library_directory}", libPath)
            .replaceAll("${classpath_separator}", classpathSeparator)
            .replaceAll("${version_name}", forgeData.id)
        );
      });
    }
    //args.push('-Dlog4j.configurationFile=D:\\WesterosCraft\\game\\common\\assets\\log_configs\\client-1.12.xml')
    args.push("-Dlog4j2.formatMsgNoLookups=true");

    // Java Arguments
    if (process.platform === "darwin") {
      args.push("-Xdock:name=NumaLauncher");
      args.push("-Xdock:icon=" + path.join(__dirname, "..", "images", "minecraft.icns"));
    }
    args.push("-Xmx" + ConfigManager.getJavaSetting().maxRAM);
    args.push("-Xms" + ConfigManager.getJavaSetting().minRAM);
    args = args.concat(ConfigManager.getJavaSetting().jvmOptions);

    // Main Java Class
    args.push(forgeData.mainClass);

    // Vanilla Arguments
    args = args.concat(versionData.arguments.game);

    args = args.reduce((acc, arg) => {
      if (typeof arg == "string") {
        return acc.concat(replaceJVMArgument(arg, valueAfterReplace));
      } else if (typeof arg === "object" && arg.rules != null) {
        // validate all rule
        const validateAllRule = (arg.rules as VersionData113Rules[]).reduce((acc, rule) => {
          if (
            "features" in rule &&
            rule.features.has_custom_resolution != null &&
            rule.features.has_custom_resolution === true
          ) {
            if (ConfigManager.getGameSetting().fullscreen) {
              arg.value = ["--fullscreen", "true"];
            }
          }
          return acc && validateRule(rule);
        }, true);
        if (validateAllRule) {
          if (typeof arg.value == "string") {
            return acc.concat(replaceJVMArgument(arg.value, valueAfterReplace));
          }
          return acc.concat(arg.value.map((v) => replaceJVMArgument(v, valueAfterReplace)));
        }
      }
      return acc;
    }, [] as string[]);

    if (isAutoconnectBroken(forgeData.id.split("-")[2])) {
      // logger.error(
      //   "Server autoconnect disabled on Forge 1.15.2 for builds earlier than 31.2.15 due to OpenGL Stack Overflow issue."
      // );
      // logger.error("Please upgrade your Forge version to at least 31.2.15!");
    } else {
      args = args.concat(_processAutoConnectArg(server));
    }

    // Forge Specific Arguments
    args = args.concat(forgeData.arguments.game);

    return args as string[];
  }
}

function validateRule(rule: VersionData113Rules) {
  if ("os" in rule && rule.os != null) {
    if (
      "name" in rule.os &&
      rule.os.name === mojangFriendlyOS() &&
      (!("version" in rule.os) || rule.os.version == null || new RegExp(rule.os.version).test(os.release()))
    ) {
      if (rule.action === "allow") {
        return true;
      }
    } else {
      return true;
    }
  } else if ("features" in rule && rule.features != null) {
    // We don't have many 'features' in the index at the moment.
    // This should be fine for a while.
    if (rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true) {
      return true;
    }
  }
  return false;
}
function isAutoconnectBroken(forgeVersion: string): boolean {
  const minWorking = [31, 2, 15];
  const verSplit = forgeVersion.split(".").map((v) => Number(v));

  if (verSplit[0] === 31) {
    for (let i = 0; i < minWorking.length; i++) {
      if (verSplit[i] > minWorking[i]) {
        return false;
      } else if (verSplit[i] < minWorking[i]) {
        return true;
      }
    }
  }

  return false;
}
