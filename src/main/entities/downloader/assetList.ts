import { Asset } from "./asset";

export type AssetListTag = "assets" | "libraries" | "files" | "forge";
export class AssetList {
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
    public tag: AssetListTag,
    public callback?: (asset: Asset) => void
  ) {}
}
