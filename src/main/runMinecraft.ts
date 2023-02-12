import { app } from "electron";
import { AssetGuard } from "./assetguard";
import { ConfigManager } from "./config/configManager";
import { DistroManager } from "./distribution/distroManager";
import ProcessBuilder from "./processbuilder";
import { getJDKPath } from "./utils/util";

export async function runMinecraft() {
  console.log("create asset guard");
  const assetGuard = new AssetGuard(ConfigManager.getLauncherSetting().getDataDirectory().common.$path, getJDKPath());
  const { forgeData, versionData, error } = await assetGuard.validateEverything(
    ConfigManager.INSTANCE.config.selectedServer,
    true
  );
  console.log("validate everything", error);
  const pb = new ProcessBuilder(
    DistroManager.getDistribution()!.getServer(ConfigManager.INSTANCE.config.selectedServer)!,
    versionData,
    forgeData,
    ConfigManager.INSTANCE.config.accounts[ConfigManager.INSTANCE.config.selectedUUID],
    app.getVersion()
  );
  pb.build();
}
