import { DiscordJson, DistroJson } from "./json";
import { Server } from "./server";

export class DistroIndex implements DistroJson {
  mainServer: string;
  constructor(public version: string, public rss: string, public discord: DiscordJson, public servers: Server[]) {
    this.mainServer = this.servers.find((server) => server.mainServer)?.id || this.servers[0]?.id;
  }
  getServer(serverID: string) {
    return this.servers.find((server) => server.id === serverID);
  }
}
