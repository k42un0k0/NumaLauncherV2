export interface ForgeData112 {
  _comment_: string[];
  id: string;
  time: string;
  releaseTime: string;
  type: string;
  mainClass: string;
  inheritsFrom: string;
  logging: Logging;
  minecraftArguments: string;
  libraries: Library[];
}

export interface Logging {
  [key: ObjectKey]: unknown;
}

export interface Library {
  name: string;
  downloads: Downloads;
}

export interface Downloads {
  artifact: Artifact;
}

export interface Artifact {
  path: string;
  url: string;
  sha1: string;
  size: number;
}
