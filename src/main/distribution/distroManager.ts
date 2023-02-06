import { DistroIndex, Server, Module, Required, Artifact } from "./classes";
import { DistroJson, ModuleJson } from "./json";

export class DistroManager {
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
        subModules(server.modules, server.id)
      );
    });

    return (DistroManager.INSTANCE.data = new DistroIndex(dist.version, dist.rss, dist.discord, servers));
  }
}
