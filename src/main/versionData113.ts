export interface VersionData113 {
  arguments: Arguments;
  assetIndex: AssetIndex;
  assets: string;
  complianceLevel: number;
  downloads: Downloads;
  id: string;
  javaVersion: JavaVersion;
  libraries: Library[];
  logging: Logging;
  mainClass: string;
  minimumLauncherVersion: number;
  releaseTime: string;
  time: string;
  type: string;
}

export interface Arguments {
  game: (string | Game)[];
  jvm: [Jvm, Jvm2, Jvm3, Jvm4, string, string, string, string, string];
}

export type VersionDataArg = string | Jvm | Jvm2 | Jvm3 | Jvm4 | Game;
export interface Game {
  rules: Rule6[];
  value: string[] | string;
}

export interface Rule6 {
  action: string;
  features: Record<string, boolean>;
}
export interface Jvm {
  rules: Rule[];
  value: string[];
}

export interface Rule {
  action: string;
  os: Os;
}

export interface Os {
  name: string;
}

export interface Jvm2 {
  rules: Rule2[];
  value: string;
}

export interface Rule2 {
  action: string;
  os: Os2;
}

export interface Os2 {
  name: string;
}

export interface Jvm3 {
  rules: Rule3[];
  value: string[];
}

export interface Rule3 {
  action: string;
  os: Os3;
}

export interface Os3 {
  name: string;
  version: string;
}

export interface Jvm4 {
  rules: Rule4[];
  value: string;
}

export interface Rule4 {
  action: string;
  os: Os4;
}

export type VersionData113Rules = Rule | Rule2 | Rule3 | Rule4 | Rule5 | Rule6;

export interface Os4 {
  arch: string;
}

export interface AssetIndex {
  id: string;
  sha1: string;
  size: number;
  totalSize: number;
  url: string;
}

export interface Downloads {
  client: Client;
  client_mappings: ClientMappings;
  server: Server;
  server_mappings: ServerMappings;
}

export interface Client {
  sha1: string;
  size: number;
  url: string;
}

export interface ClientMappings {
  sha1: string;
  size: number;
  url: string;
}

export interface Server {
  sha1: string;
  size: number;
  url: string;
}

export interface ServerMappings {
  sha1: string;
  size: number;
  url: string;
}

export interface JavaVersion {
  component: string;
  majorVersion: number;
}

export interface Library {
  downloads: Downloads2;
  name: string;
  rules?: Rule5[];
  natives?: Natives;
  extract?: Extract;
}

export interface Downloads2 {
  artifact: Artifact;
  classifiers: Classifiers;
}

export interface Artifact {
  path: string;
  sha1: string;
  size: number;
  url: string;
}

export interface Classifiers {
  [key: string]: Javadoc;
  //   javadoc?: Javadoc;
  //   "natives-osx"?: NativesOsx;
  //   sources?: Sources;
  //   "natives-linux"?: NativesLinux;
  //   "natives-windows"?: NativesWindows;
  //   "natives-macos"?: NativesMacos;
}

export interface Javadoc {
  path: string;
  sha1: string;
  size: number;
  url: string;
}

export interface Rule5 {
  action: string;
  os?: Os5;
}

export interface Os5 {
  name: string;
}

export interface Natives {
  osx?: string;
  linux?: string;
  windows?: string;
}

export interface Extract {
  exclude: string[];
}

export interface Logging {
  client: Client2;
}

export interface Client2 {
  argument: string;
  file: File;
  type: string;
}

export interface File {
  id: string;
  sha1: string;
  size: number;
  url: string;
}
