import path from "path";
import { ConfigManager } from "../config/configManager";
import { ArtifactJson, DiscordJson, DiscordJson2, DistroJson, ManualJson, ModuleJson, ServerJson } from "./json";
import { Types } from "./constatnts";

export class DistroIndex implements DistroJson {
  mainServer: string;
  constructor(public version: string, public rss: string, public discord: DiscordJson, public servers: Server[]) {
    this.mainServer = this.servers.find((server) => server.mainServer)?.id || this.servers[0]?.id;
  }
  getServer(serverID: string) {
    return this.servers.find((server) => server.id === serverID);
  }
}
export class Server implements ServerJson {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public version: string,
    public address: string,
    public minecraftVersion: string,
    public discord: DiscordJson2,
    public mainServer: boolean,
    public autoconnect: boolean,
    public modules: Module[],
    public icon?: string
  ) {}
}

export class Module implements ModuleJson {
  artifactExt: string;
  artifactClassifier?: string;
  artifactVersion: string;
  artifactID: string;
  artifactGroup: string;
  artifactPath: string;
  versionLessID: string;
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public required: Required,
    public artifact: Artifact,
    serverID: string,
    public subModules?: Module[]
  ) {
    const [meta, ext] = this.id.split("@");
    const metaArr = meta.split(":");
    this.artifactExt = ext || this._resolveDefaultExtension(type);
    this.artifactClassifier = metaArr[3] || undefined;
    this.artifactVersion = metaArr[2] || "???";
    this.artifactID = metaArr[1] || "???";
    this.artifactGroup = metaArr[0] || "???";
    this.artifactPath = this._resolveArtifactPath(serverID);
    this.versionLessID = this.artifactGroup + ":" + this.artifactID;
  }
  getExtension() {
    throw new Error("Method not implemented.");
  }
  getExtensionlessID() {
    return this.id.split("@")[0];
  }
  private _resolveDefaultExtension(type: string) {
    switch (type) {
      case Types.Library:
      case Types.ForgeHosted:
      case Types.LiteLoader:
      case Types.ForgeMod:
        return "jar";
      case Types.LiteMod:
        return "litemod";
      case Types.File:
      default:
        return "jar"; // There is no default extension really.
    }
  }
  private _resolveArtifactPath(serverid: string): string {
    const pth =
      this.artifact.path ||
      path.join(
        ...this.artifactGroup.split("."),
        this.artifactID,
        this.artifactVersion,
        `${this.artifactID}-${this.artifactVersion}${
          this.artifactClassifier != undefined ? `-${this.artifactClassifier}` : ""
        }.${this.artifactExt}`
      );

    switch (this.type) {
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
          .common.versions.$join(this.artifactID, `${this.id}.json`);
      case Types.File:
      default:
        return ConfigManager.getLauncherSetting().getDataDirectory().instances.$join(serverid, pth);
    }
  }
}
export class Required {
  value: boolean;
  def: boolean;
  constructor(value?: boolean, def?: boolean) {
    this.value = value == null ? true : value;
    this.def = def == null ? true : def;
  }
}
export class Artifact implements ArtifactJson {
  constructor(
    public size: number,
    public MD5: string,
    public url: string,
    public manual?: ManualJson,
    public path?: string
  ) {}
}
