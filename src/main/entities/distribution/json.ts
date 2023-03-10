export interface DistroJson {
  version: string;
  rss: string;
  discord: DiscordJson;
  servers: ServerJson[];
}

export interface DiscordJson {
  clientId: string;
  smallImageText: string;
  smallImageKey: string;
}

export interface ServerJson {
  id: string;
  name: string;
  description: string;
  icon?: string;
  version: string;
  address: string;
  minecraftVersion: string;
  discord: DiscordJson2;
  mainServer: boolean;
  autoconnect: boolean;
  modules: ModuleJson[];
}

export interface DiscordJson2 {
  shortId: string;
  largeImageText: string;
  largeImageKey: string;
}

export interface ModuleJson {
  id: string;
  name: string;
  type: string;
  artifact: ArtifactJson;
  subModules?: ModuleJson[];
  required?: RequiredJson;
}

export interface ArtifactJson {
  size: number;
  MD5: string;
  url: string;
  manual?: ManualJson;
  path?: string;
}

export interface ManualJson {
  url: string;
  name: string;
  hints?: HintJson[];
  video?: string;
}

export interface HintJson {
  css: string;
  script?: string;
}

export interface RequiredJson {
  value: boolean;
  def?: boolean;
}
