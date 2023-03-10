import axios from "axios";
import fs from "fs-extra";
import { paths } from "../utils/paths";
import { DistroIndex } from "../entities/distribution/distroIndex";
import { Artifact } from "../entities/distribution/artifact";
import { Required } from "../entities/distribution/required";
import { Module } from "../entities/distribution/module";
import { Server } from "../entities/distribution/server";
import { DistroJson, ModuleJson } from "../entities/distribution/json";
import { ModSetting } from "../entities/config/modSetting";
import { ConfigManager } from "./configManager";

export class DistroManager {
  async load() {
    const distroURL = "https://raw.githubusercontent.com/TeamKun/ModPacks/deploy/distribution.json";
    const response = await axios.get<DistroJson>(distroURL, { timeout: 2500 });
    const distroIndex = DistroManager.jsonToDistroIndex(response.data);
    fs.writeFileSync(paths.launcher.distroFile, JSON.stringify(response.data));
    if (
      !ConfigManager.INSTANCE.config.selectedServer ||
      this.data?.getServer(ConfigManager.INSTANCE.config.selectedServer) == null
    ) {
      ConfigManager.INSTANCE.config.selectedServer = distroIndex.mainServer;
    }
    ConfigManager.INSTANCE.config.setting.mods = distroIndex.servers.map((server) => {
      const id = server.id;
      const modules = server.modules;
      const setting = ConfigManager.getModsSetting(id) || new ModSetting(id, {});
      setting.mergeDistroModules(modules);
      return setting;
    });
    ConfigManager.INSTANCE.save();
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
    function createModules(modules: ModuleJson[], serverId: string): Module[] {
      return modules.map((module) => {
        const required = new Required(module.required?.value, module.required?.def);
        const artifact = new Artifact(
          module.artifact.size,
          module.artifact.MD5,
          module.artifact.url,
          module.artifact.manual,
          module.artifact.path,
          module.id,
          module.type,
          serverId,
          ConfigManager.getLauncherSetting()
        );
        return new Module(
          module.id,
          module.name,
          module.type,
          required,
          artifact,
          module.subModules && createModules(module.subModules, serverId)
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
        createModules(server.modules, server.id),
        server.icon
      );
    });

    return (DistroManager.INSTANCE.data = new DistroIndex(dist.version, dist.rss, dist.discord, servers));
  }
}
