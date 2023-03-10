import fs from "fs-extra";
import crypto from "crypto";
import { AssetListTag, AssetList } from "@/main/entities/downloader/assetList";
import { Asset } from "@/main/entities/downloader/asset";
import { Module } from "@/main/entities/distribution/module";
import { AssetListRepository } from "@/main/entities/downloader/assetListRepository";
import { validateLocal } from "../helper";

export class AssetListRepositoryImple implements AssetListRepository {
  fromAssetList(tag: AssetListTag, algo: string, assets: Asset[], cb?: (index: number) => void) {
    const dlqueue: Asset[] = [];
    let dlsize = 0;
    assets.forEach((asset, i) => {
      if (!validateLocal(asset.to, algo, asset.hash)) {
        dlqueue.push(asset);
        dlsize += asset.size;
        cb && cb(i);
      }
    });
    return new AssetList(dlqueue, dlsize, tag);
  }
  fromModules(tag: AssetListTag, algo: string, modules: Module[]): [AssetList, string[]] {
    let extractQueue: string[] = [];
    let dlqueue: Asset[] = [];
    let dlsize = 0;
    modules.forEach((module) => {
      const artifact = module.artifact;
      const artifactPath = artifact.path;
      const asset = new Asset(module.id, artifact.MD5, artifact.size, artifact.url, artifactPath);
      const validationPath = artifactPath.toLowerCase().endsWith(".pack.xz")
        ? artifactPath.substring(0, artifactPath.toLowerCase().lastIndexOf(".pack.xz"))
        : artifactPath;
      if (!validateLocal(validationPath, algo, asset.hash)) {
        dlqueue.push(asset);
        dlsize += asset.size;
        if (validationPath !== artifactPath) extractQueue.push(artifactPath);
      }
      if (module.subModules != null) {
        const [subDlTracker, subExtractQueue] = this.fromModules(tag, algo, module.subModules);
        dlqueue = dlqueue.concat(subDlTracker.dlqueue);
        dlsize += subDlTracker.dlsize;
        extractQueue = extractQueue.concat(subExtractQueue);
      }
    });
    return [new AssetList(dlqueue, dlsize, tag), extractQueue];
  }
}
