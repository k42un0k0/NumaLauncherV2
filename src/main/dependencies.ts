import { AssetListRepositoryImple } from "./drivers/repositoryImple/assetListRepositoryImple";
import { ConfigRepositoryImple } from "./drivers/repositoryImple/configRepositoryImple";
import { DistributionRepositoryImple } from "./drivers/repositoryImple/distoributionRepositoryImple";
import { ForgeRepositoryImple } from "./drivers/repositoryImple/forgeRepositoryImple";
import { MsaLoginStateImple } from "./drivers/stateImple/msaLoginStateImple";
import { MsaLoginInteractor } from "./usecases/msaLogin";
import { RunMinecraftInteractor } from "./usecases/runMinecraft";

export function createDependencies() {
  const msaLoginState = new MsaLoginStateImple();
  const assetListRepository = new AssetListRepositoryImple();
  const configRepository = new ConfigRepositoryImple();
  const distributionRepository = new DistributionRepositoryImple();
  const forgeRepository = new ForgeRepositoryImple(configRepository, assetListRepository);
  const msaLoginInteractor = new MsaLoginInteractor(msaLoginState, configRepository);
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
    msaLoginInteractor,
    runMinecraftInteractor,
  };
  return dependencies;
}
export type Dependencies = ReturnType<typeof createDependencies>;
