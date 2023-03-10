import path from "path";
import os from "os";
import { DistroManager } from "../drivers/distroManager";
import { ForgeData112 } from "../entities/versionManifest/forgeData112";
import { ForgeData113 } from "../entities/versionManifest/forgeData113";
import { app, BrowserWindow } from "electron";
import { ConfigManager } from "../drivers/configManager";
export function mojangFriendlyOS() {
  if (isMac) {
    return "osx";
  } else if (isWindows) {
    return "windows";
  } else if (isLinux) {
    return "linux";
  } else {
    throw Error();
  }
}

export const isWindows = process.platform === "win32";
export const isMac = process.platform === "darwin";
export const isLinux = process.platform === "linux";
export const isAappleSilicon = /^Apple/.test(os.cpus()[0].model);

export const isDev = process.env.NODE_ENV === "development";

export function mcVersionAtLeast(desired: string, actual: string) {
  const des = desired.split(".");
  const act = actual.split(".");

  for (let i = 0; i < des.length; i++) {
    if (!(parseInt(act[i]) >= parseInt(des[i]))) {
      return false;
    }
  }
  return true;
}

export function forEachOfLimit<T>(
  coll: T[],
  limit: number,
  iteratee: (value: T, index: number) => Promise<void>
): Promise<void> {
  if (!Array.isArray(coll)) throw new Error();
  let globalIndex = 0;
  const last = coll.length;
  const iterater = (localIndex: number): Promise<void> => {
    if (localIndex >= last) return Promise.resolve();
    if (coll[localIndex] == null) return Promise.resolve();
    return iteratee(coll[localIndex], localIndex)
      .then((): Promise<void> => {
        return iterater(globalIndex++);
      })
      .catch(() => {
        iterater(globalIndex++);
      });
  };
  const promise: Promise<void>[] = [];
  for (let i = 0; i < limit; i++) {
    promise.push(iterater(globalIndex++));
  }
  return Promise.all(promise).then(() => {
    void 0;
  });
}

export function isForgeGradle3(mcVersion: string, forgeVersion: string) {
  if (mcVersionAtLeast("1.13", mcVersion)) {
    return true;
  }

  try {
    const forgeVer = forgeVersion.split("-")[1];

    const maxFG2 = [14, 23, 5, 2847];
    const verSplit = forgeVer.split(".").map((v) => Number(v));

    for (let i = 0; i < maxFG2.length; i++) {
      if (verSplit[i] > maxFG2[i]) {
        return true;
      } else if (verSplit[i] < maxFG2[i]) {
        return false;
      }
    }

    return false;
  } catch (err) {
    throw new Error("Forge version is complex (changed).. launcher requires a patch.");
  }
}
export function getJDKPath() {
  const executable = ConfigManager.getJavaSetting().executable;
  if (executable) {
    return executable;
  }
  const mcVersion = DistroManager.getDistribution()!.getServer(
    ConfigManager.INSTANCE.config.selectedServer
  )!.minecraftVersion;

  const [sanitizedOS, midwayPath, fileName, basePath] = getBasePath();
  const jdkMajorVersion = getJDKMajorVersion(mcVersion);

  const jdkPath = path.join(basePath, sanitizedOS, jdkMajorVersion, midwayPath, fileName);

  return jdkPath;
}

function getJDKMajorVersion(mcVersion: string) {
  // less than MC1.17
  if (!mcVersionAtLeast("1.17", mcVersion)) {
    return "8";

    // MC1.17
  }
  if (!mcVersionAtLeast("1.18", mcVersion)) {
    return "16";

    // MC1.18+
  }
  return "17";
}

type SanitizedOS = "windows" | "mac-apple" | "mac-intel" | "linux";
type MidwayPath = "bin" | string;
type FileName = "javaw.exe" | "java";
type BasePath = string;
function getBasePath(): [SanitizedOS, MidwayPath, FileName, BasePath] {
  if (isWindows) {
    const basePath = isDev ? path.join(process.cwd(), "jdk") : path.join(process.cwd(), "Resources", "jdk");
    return ["windows", "bin", "javaw.exe", basePath];
  }
  if (isMac) {
    const sanitizedOS = isAappleSilicon ? "mac-apple" : "mac-intel";
    const basePath = isDev ? path.join(app.getAppPath(), "jdk") : path.join(app.getAppPath(), "jdk");
    return [sanitizedOS, path.join("Contents", "Home", "bin"), "java", basePath];
  }
  if (isLinux) return ["linux", "bin", "java", path.join(process.cwd(), "resources", "jdk")];
  throw new Error("unknown OS");
}

export function _lteMinorVersion(forgeData: ForgeData112 | ForgeData113, version: number) {
  return Number(forgeData.id.split("-")[0].split(".")[1]) <= Number(version);
}

export function broadcast(channel: string, ...args: any[]) {
  const wins = BrowserWindow.getAllWindows();
  wins.map((win) => {
    win.webContents.send(channel, ...args);
  });
}
