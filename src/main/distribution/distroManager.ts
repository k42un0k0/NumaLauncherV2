import axios from "axios";
import fs from "fs-extra";
import { ConfigManager } from "../config/configManager";
import { paths } from "../utils/paths";
import { DistroIndex } from "./distroIndex";
import { Artifact } from "./artifact";
import { Required } from "./required";
import { Module } from "./module";
import { Server } from "./server";
import { DistroJson, ModuleJson } from "./json";

export class DistroManager {
  async load() {
    const distroURL = "https://raw.githubusercontent.com/TeamKun/ModPacks/deploy/distribution.json";
    const response = await axios.get<DistroJson>(distroURL, { timeout: 2500 });
    const data = DistroManager.jsonToDistroIndex(response.data);
    fs.writeFileSync(paths.launcher.distroFile, JSON.stringify(response.data));
    if (
      !ConfigManager.INSTANCE.config.selectedServer ||
      this.data?.getServer(ConfigManager.INSTANCE.config.selectedServer) == null
    ) {
      ConfigManager.INSTANCE.config.selectedServer = data.mainServer;
      ConfigManager.INSTANCE.save();
    }
    return data;
  }

  async loadLocal() {
    const buf = fs.readFileSync(paths.launcher.distroFile, "utf-8");
    return DistroManager.jsonToDistroIndex(JSON.parse(buf));
  }

  private static instance: DistroManager;
  static get INSTANCE() {
    if (DistroManager.instance == null) {
      return (DistroManager.instance = new DistroManager());
    }
    return DistroManager.instance;
  }
  data?: DistroIndex;
  static getDistribution() {
    return DistroManager.INSTANCE.data;
  }
  static jsonToDistroIndex(dist: DistroJson): DistroIndex {
    function subModules(modules: ModuleJson[], serverid: string): Module[] {
      return modules.map((module) => {
        const required: Required = new Required(module.required?.value, module.required?.value);
        const artifact = new Artifact(
          module.artifact.size,
          module.artifact.MD5,
          module.artifact.url,
          module.artifact.manual,
          module.artifact.path
        );
        return new Module(
          module.id,
          module.name,
          module.type,
          required,
          artifact,
          serverid,
          module.subModules && subModules(module.subModules, serverid)
        );
      });
    }
    const servers = dist.servers.map((server) => {
      return new Server(
        server.id,
        server.name,
        server.description,
        server.version,
        server.address,
        server.minecraftVersion,
        server.discord,
        server.mainServer,
        server.autoconnect,
        subModules(server.modules, server.id),
        server.icon
      );
    });

    return (DistroManager.INSTANCE.data = new DistroIndex(dist.version, dist.rss, dist.discord, servers));
  }
}
