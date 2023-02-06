export interface ForgeData113 {
  _comment_: string[];
  id: string;
  time: string;
  releaseTime: string;
  type: string;
  mainClass: string;
  inheritsFrom: string;
  logging: Logging;
  arguments: Arguments;
  libraries: Library[];
}

export interface Logging {
  [key: ObjectKey]: unknown;
}

export interface Arguments {
  game: string[];
  jvm: string[];
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
