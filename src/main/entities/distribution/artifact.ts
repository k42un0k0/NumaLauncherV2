import { ConfigManager } from "@/main/drivers/configManager";
import path from "path";
import { LauncherSetting } from "../config/launcherSetting";
import { Types } from "./constatnts";
import { resolveDefaultExtension } from "./helper";
import { ArtifactJson, ManualJson } from "./json";

export class Artifact implements ArtifactJson {
  path: string;
  constructor(
    public size: number,
    public MD5: string,
    public url: string,
    public manual: ManualJson | undefined,
    path: string | undefined,
    moduleId: string,
    moduleType: string,
    serverId: string,
    launcherSetting: LauncherSetting
  ) {
    this.path = path || this.resolvePath(moduleId, moduleType, serverId, launcherSetting);
  }
  private resolvePath(moduleId: string, moduleType: string, serverId: string, launcherSetting: LauncherSetting) {
    const [meta, ext] = moduleId.split("@");
    const metaArr = meta.split(":");
    const artifactExt = ext || resolveDefaultExtension(moduleType);
    const artifactClassifier = metaArr[3] || undefined;
    const artifactVersion = metaArr[2] || "???";
    const artifactID = metaArr[1] || "???";
    const artifactGroup = metaArr[0] || "???";
    const pth = path.join(
      ...artifactGroup.split("."),
      artifactID,
      artifactVersion,
      `${artifactID}-${artifactVersion}${
        artifactClassifier != undefined ? `-${artifactClassifier}` : ""
      }.${artifactExt}`
    );

    switch (moduleType) {
      case Types.Library:
      case Types.ForgeHosted:
      case Types.LiteLoader:
        return launcherSetting.getDataDirectory().common.libraries.$join(pth);
      case Types.ForgeMod:
      case Types.LiteMod:
        return launcherSetting.getDataDirectory().common.modstore.$join(pth);
      case Types.VersionManifest:
        return launcherSetting.getDataDirectory().common.versions.$join(artifactID, `${moduleId}.json`);
      case Types.File:
      default:
        return launcherSetting.getDataDirectory().instances.$join(serverId, pth);
    }
  }
}
