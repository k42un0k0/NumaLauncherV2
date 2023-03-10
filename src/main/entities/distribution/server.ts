import { DiscordJson2, ServerJson } from "./json";
import { Module } from "./module";

export class Server implements ServerJson {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public version: string,
    public address: string,
    public minecraftVersion: string,
    public discord: DiscordJson2,
    public mainServer: boolean,
    public autoconnect: boolean,
    public modules: Module[],
    public icon?: string
  ) {}
}
