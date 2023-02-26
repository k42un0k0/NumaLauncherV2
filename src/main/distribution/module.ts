import { ModuleJson } from "./json";
import { Artifact } from "./artifact";
import { Required } from "./required";
import { resolveDefaultExtension } from "./helper";

export class Module implements ModuleJson {
  artifactExt: string;
  artifactClassifier?: string;
  artifactVersion: string;
  artifactID: string;
  artifactGroup: string;
  versionLessID: string;
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public required: Required,
    public artifact: Artifact,
    public subModules?: Module[]
  ) {
    const [meta, ext] = this.id.split("@");
    const metaArr = meta.split(":");
    this.artifactExt = ext || resolveDefaultExtension(type);
    this.artifactClassifier = metaArr[3] || undefined;
    this.artifactVersion = metaArr[2] || "???";
    this.artifactID = metaArr[1] || "???";
    this.artifactGroup = metaArr[0] || "???";
    this.versionLessID = this.artifactGroup + ":" + this.artifactID;
  }
  getExtensionlessID() {
    return this.id.split("@")[0];
  }
}
