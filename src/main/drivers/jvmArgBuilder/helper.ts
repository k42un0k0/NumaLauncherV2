import { ModSetting } from "../../entities/config/modSetting";
import { Module } from "../../entities/distribution/module";
import { Server } from "../../entities/distribution/server";
import { Types } from "../../entities/distribution/constatnts";
import { ConfigManager } from "../configManager";

export const classpathSeparator = process.platform === "win32" ? ";" : ":";

export const argDiscovery = /\${*(.*)}/;
export function replaceJVMArgument(arg: string, valueAfterReplace: (value: string) => Record<string, string>): string {
  if (argDiscovery.test(arg)) {
    const identifier = arg.match(argDiscovery)![1];
    return valueAfterReplace(arg)[identifier] || arg;
  }
  return arg;
}

export function _processAutoConnectArg(server: Server): string[] {
  const result = [];
  if (ConfigManager.getGameSetting().autoConnect && server.autoconnect) {
    const serverURL = new URL("my://" + server.address);
    result.push("--server");
    result.push(serverURL.hostname);
    if (serverURL.port) {
      result.push("--port");
      result.push(serverURL.port);
    }
  }
  return result;
}

export function resolveModConfiguration(modCfg: ModSetting, mdls: Module[]) {
  const fMods: Module[] = [];
  const lMods: Module[] = [];

  mdls.forEach((mdl) => {
    const type = mdl.type;
    if (type === Types.ForgeMod || type === Types.LiteMod || type === Types.LiteLoader) {
      const unnecessary = !mdl.required?.value;
      const enabled = modCfg.isModEnabled(mdl.versionLessID, mdl.required.def);
      if (!unnecessary || (unnecessary && enabled)) {
        if (mdl.type === Types.ForgeMod) {
          fMods.push(mdl);
        } else {
          lMods.push(mdl);
        }
      }
    }
  });

  return {
    fMods,
    lMods,
  };
}
