import { Module } from "../distribution/module";
import { Asset } from "./asset";
import { validateLocal } from "./helper";

type DLTrackerTag = "assets" | "libraries" | "files" | "forge";
export class DLTracker {
  /**
   * Create a DLTracker
   *
   * @param {Array.<Asset>} dlqueue An array containing assets queued for download.
   * @param {number} dlsize The combined size of each asset in the download queue array.
   * @param {function(Asset)} callback Optional callback which is called when an asset finishes downloading.
   */
  constructor(
    public dlqueue: Asset[],
    public dlsize: number,
    public tag: DLTrackerTag,
    public callback?: (asset: Asset) => void
  ) {}
  static fromAssetList(tag: DLTrackerTag, algo: string, assets: Asset[], cb?: (index: number) => void) {
    const dlqueue: Asset[] = [];
    let dlsize = 0;
    assets.forEach((asset, i) => {
      if (!validateLocal(asset.to, algo, asset.hash)) {
        dlqueue.push(asset);
        dlsize += asset.size;
        cb && cb(i);
      }
    });
    return new DLTracker(dlqueue, dlsize, tag);
  }
  static fromModules(tag: DLTrackerTag, algo: string, modules: Module[]): [DLTracker, string[]] {
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
        const [subDlTracker, subExtractQueue] = DLTracker.fromModules(tag, algo, module.subModules);
        dlqueue = dlqueue.concat(subDlTracker.dlqueue);
        dlsize += subDlTracker.dlsize;
        extractQueue = extractQueue.concat(subExtractQueue);
      }
    });
    return [new DLTracker(dlqueue, dlsize, tag), extractQueue];
  }
}
