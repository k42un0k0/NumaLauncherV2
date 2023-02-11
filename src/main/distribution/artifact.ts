import { ArtifactJson, ManualJson } from "./json";

export class Artifact implements ArtifactJson {
  constructor(
    public size: number,
    public MD5: string,
    public url: string,
    public manual?: ManualJson,
    public path?: string
  ) {}
}
