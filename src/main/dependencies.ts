import { AssetListRepositoryImple } from "./drivers/repositoryImple/assetListRepositoryImple";
import { ConfigRepositoryImple } from "./drivers/repositoryImple/configRepositoryImple";
import { DistributionRepositoryImple } from "./drivers/repositoryImple/distoributionRepositoryImple";
import { ForgeRepositoryImple } from "./drivers/repositoryImple/forgeRepositoryImple";
import { RunMinecraftInteractor } from "./usecases/runMinecraft";

export function createDependencies() {
  const assetListRepository = new AssetListRepositoryImple();
  const configRepository = new ConfigRepositoryImple();
  const distributionRepository = new DistributionRepositoryImple();
  const forgeRepository = new ForgeRepositoryImple(configRepository, assetListRepository);
  const runMinecraftInteractor = new RunMinecraftInteractor(
    configRepository,
    distributionRepository,
    assetListRepository,
    forgeRepository
  );
  const dependencies = {
    assetListRepository,
    configRepository,
    distributionRepository,
    forgeRepository,
    runMinecraftInteractor,
  };
  return dependencies;
}
export type Dependencies = ReturnType<typeof createDependencies>;
