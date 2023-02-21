import { ConfigManager } from "../config/configManager";
import { VersionData112 } from "../versionManifest/versionData112";
import { VersionData113 } from "../versionManifest/versionData113";
import { Asset } from "./asset";
import { DLTracker } from "./dlTracker";
import path from "path";
import { getAssetIndex, validateRules } from "../versionManifest/helper";
import { Server } from "../distribution/server";
import { mojangFriendlyOS } from "../utils/util";
import { WebContents } from "electron";
import { RendererChannel } from "../utils/channels";

export async function validateAssets(versionData: VersionData112 | VersionData113, sender: WebContents) {
  const data = await getAssetIndex(versionData);
  //Asset constants
  function toAsset(key: string) {
    const resourceURL = "https://resources.download.minecraft.net/";
    const localPath = ConfigManager.getLauncherSetting().getDataDirectory().common.assets;
    const hash = data.objects[key].hash;
    const assetName = path.join(hash.substring(0, 2), hash);
    const urlName = hash.substring(0, 2) + "/" + hash;
    return new Asset(key, hash, data.objects[key].size, resourceURL + urlName, localPath.objects.$join(assetName));
  }
  const assets = Object.keys(data.objects).map(toAsset);
  return DLTracker.fromAssetList("assets", "sha1", assets, (index) => {
    sender.send(RendererChannel.ON_RUN_MINECRAFT, {
      type: "progress",
      payload: { type: "assets", total: assets.length, progress: index },
    });
  });
}

export function validateMiscellaneous(versionData: VersionData112 | VersionData113) {
  const clientData = versionData.downloads.client;
  const version = versionData.id;

  const clientAsset = new Asset(
    version + " client",
    clientData.sha1,
    clientData.size,
    clientData.url,
    ConfigManager.getLauncherSetting()
      .getDataDirectory()
      .common.versions.$join(version, version + ".jar")
  );

  const file = versionData.logging.client.file;
  const logConfigAsset = new Asset(
    file.id,
    file.sha1,
    file.size,
    file.url,
    ConfigManager.getLauncherSetting().getDataDirectory().common.assets.log_configs.$join(file.id)
  );

  return DLTracker.fromAssetList("files", "sha1", [clientAsset, logConfigAsset]);
}
export function validateDistribution(server: Server) {
  return DLTracker.fromModules("forge", "MD5", server.modules);
}

export async function validateLibraries(versionData: VersionData112 | VersionData113) {
  const assets: Asset[] = [];
  versionData.libraries.forEach((lib) => {
    if (!("natives" in lib) || validateRules(lib.rules, lib.natives)) {
      const artifact =
        !("natives" in lib) || lib.natives == null
          ? lib.downloads.artifact
          : lib.downloads.classifiers[
              lib.natives[mojangFriendlyOS()]?.replace("${arch}", process.arch.replace("x", "")) || ""
            ];
      assets.push(
        new Asset(
          lib.name,
          artifact.sha1,
          artifact.size,
          artifact.url,
          ConfigManager.getLauncherSetting().getDataDirectory().common.libraries.$join(artifact.path)
        )
      );
    }
  });
  return DLTracker.fromAssetList("libraries", "sha1", assets);
}
