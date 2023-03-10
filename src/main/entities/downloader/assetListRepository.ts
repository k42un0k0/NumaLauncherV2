import fs from "fs-extra";
import crypto from "crypto";
import { AssetList, AssetListTag } from "./assetList";
import { Asset } from "./asset";
import { Module } from "../distribution/module";

export interface AssetListRepository {
  fromAssetList(tag: AssetListTag, algo: string, assets: Asset[], cb?: (index: number) => void): AssetList;
  fromModules(tag: AssetListTag, algo: string, modules: Module[]): [AssetList, string[]];
}
