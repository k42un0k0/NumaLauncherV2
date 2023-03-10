import axios from "axios";
import fs from "fs-extra";
import { DistroIndex } from "./distroIndex";

export interface DistributionRepository {
  load(): Promise<void>;
  loadLocal(): Promise<DistroIndex>;
  getDistribution(): DistroIndex | undefined;
}
