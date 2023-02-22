import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { getVersionDataUrl } from "../api/mojang";
import { ConfigManager } from "../config/configManager";
import { mojangFriendlyOS } from "../utils/util";
import { VersionData112 } from "./versionData112";
import { VersionData113 } from "./versionData113";

export async function getAssetIndex(versionData: VersionData112 | VersionData113) {
  const assetIndex = versionData.assetIndex;
  const name = assetIndex.id + ".json";
  const indexPath = ConfigManager.getLauncherSetting().getDataDirectory().common.assets.indexes;
  const assetIndexLoc = indexPath.$join(name);
  if (!fs.existsSync(assetIndexLoc)) {
    fs.ensureDirSync(indexPath.$path);
    const response = await axios.get(assetIndex.url);
    const data = response.data;
    fs.writeFileSync(assetIndexLoc, JSON.stringify(data));
    return data;
  } else {
    return JSON.parse(fs.readFileSync(assetIndexLoc, "utf-8"));
  }
}

export async function loadVersionData(version: string) {
  const versionPath = ConfigManager.getLauncherSetting().getDataDirectory().common.versions.$join(version);
  const versionFile = path.join(versionPath, version + ".json");
  if (!fs.existsSync(versionFile)) {
    const url = await getVersionDataUrl(version);
    //This download will never be tracked as it's essential and trivial.
    console.log("Preparing download of " + version + " assets.");
    fs.ensureDirSync(versionPath);
    const response = await axios.get(url);
    const data = response.data;
    fs.writeFileSync(versionFile, JSON.stringify(data));
    return data;
  } else {
    return JSON.parse(fs.readFileSync(versionFile).toString());
  }
}

export function validateRules(lib: VersionData113["libraries"][number] | VersionData112["libraries"][number]) {
  if (lib.rules == null) {
    if (!("natives" in lib) || lib.natives == null) {
      return true;
    } else {
      return lib.natives[mojangFriendlyOS()] != null;
    }
  }

  for (const rule of lib.rules) {
    const action = rule.action;
    const osProp = rule.os;
    if (action != null && osProp != null) {
      const osName = osProp.name;
      const osMoj = mojangFriendlyOS();
      if (action === "allow") {
        return osName === osMoj;
      } else if (action === "disallow") {
        return osName !== osMoj;
      }
    }
  }
  return true;
}
