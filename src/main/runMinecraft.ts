import path from "path";
import { ConfigManager } from "./config/configManager";
import fs from "fs-extra";
import { DistroManager } from "./distribution/distroManager";
import fetch from "node-fetch";
import { IpcMainInvokeEvent, WebContents } from "electron";
import { forEachOfLimit } from "./utils/util";
import electron from "electron";
import { ProcessBuilder } from "./processbuilder";
import { DLTracker } from "./downloader/dlTracker";
import { validateAssets, validateDistribution, validateLibraries, validateMiscellaneous } from "./downloader/validator";
import { loadVersionData } from "./versionManifest/helper";
import { loadForgeData } from "./forge";
import { Server } from "./distribution/server";
import { ModSettingValue } from "./config/modSetting";
import { Required } from "./distribution/required";
import { Module } from "./distribution/module";
import { Artifact } from "./distribution/artifact";
import { RendererChannel } from "./utils/channels";

export async function runMinecraft(event: IpcMainInvokeEvent) {
  const distribution = DistroManager.INSTANCE.data!;
  const selectedServer = ConfigManager.INSTANCE.config.selectedServer;
  const server = distribution.servers.find((server) => server.id == selectedServer) || distribution.servers[0];
  if (!server) {
    // サーバーが選択されてない時の処理
    throw new Error("サーバーが選択されていません");
  }
  const manualData = await loadManualData(server);
  if (manualData.length > 0) {
    event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "close", payload: manualData });

    return;
  }
  // サイズを図ってthis.forgeに入れる;
  const [forge, extractQueue] = validateDistribution(server);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "distribution" });
  const versionData = await loadVersionData(server.minecraftVersion);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "version" });
  const assets = await validateAssets(versionData, event.sender);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "assets" });
  const libraries = await validateLibraries(versionData);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "libraries" });
  const files = await validateMiscellaneous(versionData);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "files" });
  await processDLQueues(event.sender, [
    { dltracker: forge, limit: 20 },
    { dltracker: assets, limit: 20 },
    { dltracker: libraries, limit: 5 },
    { dltracker: files, limit: 5 },
  ] as { dltracker: DLTracker; limit: number }[]);
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: "forge" });
  const forgeData = await loadForgeData(server);
  const authUser = ConfigManager.INSTANCE.getSelectedAccount();
  const pb = new ProcessBuilder(server, versionData, forgeData, authUser, electron.app.getVersion());
  pb.build();
  event.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "close" });
}

async function processDLQueues(sender: WebContents, dltrackerData: { dltracker: DLTracker; limit: number }[]) {
  let progress = 0;
  let totalSize = 0;
  for (const item of dltrackerData) {
    totalSize += item.dltracker.dlsize;
    await forEachOfLimit(item.dltracker.dlqueue, item.limit, async (asset) => {
      fs.ensureDirSync(path.join(asset.to, ".."));
      const response = await fetch(asset.from);
      const size = Number(response.headers.get("content-length"));
      if (asset.size != size) {
        totalSize = -asset.size + size;
      }
      const writeStream = fs.createWriteStream(asset.to);
      response.body?.pipe(writeStream);
      response.body?.on("data", (chunk) => {
        progress += chunk.length;
        sender.send(RendererChannel.ON_RUN_MINECRAFT, {
          type: "progress",
          payload: {
            type: "download",
            progress,
            total: totalSize,
          },
        });
      });
      return new Promise((resolve) => {
        response.body?.on("close", () => resolve());
      });
    });
  }
}

/**
 * 手動ダウンロードのファイルをリストアップし、ユーザーにダウンロードを促します
 *
 * @param {string} server The Server to load Forge data for.
 * @returns {Promise.<Object>} A promise which resolves to Forge's version.json data.
 */
async function loadManualData(server: Server) {
  function isModEnabled(modCfg: ModSettingValue, required: Required) {
    return modCfg != null
      ? (typeof modCfg === "boolean" && modCfg) ||
          (typeof modCfg === "object" && (typeof modCfg.value !== "undefined" ? modCfg.value : true))
      : required != null
      ? required.def
      : true;
  }

  // 有効化されているかチェックするために必要
  const modCfg = ConfigManager.getModsSetting(server.id)!.mods;
  const mdls = server.modules;

  // 手動ダウンロードMod候補
  const manualModsCandidate: Module[] = [];
  // ON以外の手動Modは除外する
  const removeCandidate: number[] = [];
  mdls.forEach((mdl, index, object) => {
    const artifact = mdl.artifact;
    const manual = artifact.manual;
    // 手動Modかどうか
    if (manual !== undefined) {
      // ONかどうか
      const o = !mdl.required.value;
      const e = isModEnabled(modCfg[mdl.versionLessID], mdl.required);
      if (!o || (o && e)) {
        manualModsCandidate.push(mdl);
      } else {
        removeCandidate.push(index);
      }
    }
  });
  // 除外された手動Modはリストから削除
  for (let i = removeCandidate.length - 1; i >= 0; i--) mdls.splice(removeCandidate[i], 1);

  // 手動候補のModは存在を確認し、手動Modリストに追加
  const manualMods: Artifact[] = [];
  for (const mdl of manualModsCandidate) {
    const artifact = mdl.artifact;
    if (!(await fs.pathExists(mdl.artifactPath))) {
      manualMods.push(artifact);
    }
  }
  return manualMods;
}
