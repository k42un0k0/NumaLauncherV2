import { Server } from "../distribution/server";
import { ForgeData112 } from "./forgeData112";
import { ForgeData113 } from "./forgeData113";

export interface ForgeRepository {
  loadForgeData(server: Server): Promise<ForgeData112 | ForgeData113>;
}
