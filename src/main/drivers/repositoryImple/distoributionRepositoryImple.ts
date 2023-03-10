import { DistributionRepository } from "@/main/entities/distribution/distributionRepository";
import { DistroIndex } from "@/main/entities/distribution/distroIndex";
import { DistroManager } from "../distroManager";

export class DistributionRepositoryImple implements DistributionRepository {
  load(): Promise<void> {
    return DistroManager.INSTANCE.load();
  }
  loadLocal(): Promise<DistroIndex> {
    return DistroManager.INSTANCE.loadLocal();
  }
  getDistribution(): DistroIndex | undefined {
    return DistroManager.INSTANCE.data;
  }
}
