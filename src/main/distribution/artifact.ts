import path from "path";
import { ConfigManager } from "../config/configManager";
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
    serverId: string
  ) {
    this.path = path || this.resolvePath(moduleId, moduleType, serverId);
  }
  private resolvePath(moduleId: string, moduleType: string, serverId: string) {
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
        return ConfigManager.getLauncherSetting().getDataDirectory().common.libraries.$join(pth);
      case Types.ForgeMod:
      case Types.LiteMod:
        return ConfigManager.getLauncherSetting().getDataDirectory().common.modstore.$join(pth);
      case Types.VersionManifest:
        return ConfigManager.getLauncherSetting()
          .getDataDirectory()
          .common.versions.$join(artifactID, `${moduleId}.json`);
      case Types.File:
      default:
        return ConfigManager.getLauncherSetting().getDataDirectory().instances.$join(serverId, pth);
    }
  }
}
