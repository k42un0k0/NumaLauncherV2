import { Artifact } from "../entities/distribution/artifact";
import { AssetList } from "../entities/downloader/assetList";
import { RunMinecraftOB } from "../usecases/runMinecraft";

export interface RunMinecraftView {
  send(action: { type: string; payload: any }): void;
  createManualWindows(artifacts: Artifact[]): void;
  processDLQueues(
    assetListData: { assetList: AssetList; limit: number }[],
    onData: (total: number, progress: number) => void
  ): Promise<void>;
}
export class RunMinecraftPresenter implements RunMinecraftOB {
  constructor(private view: RunMinecraftView) {}
  processDLQueues(
    assetListData: { assetList: AssetList; limit: number }[],
    onData: (total: number, progress: number) => void
  ): Promise<void> {
    return this.view.processDLQueues(assetListData, onData);
  }
  createManualWindows(artifacts: Artifact[]): void {
    this.view.createManualWindows(artifacts);
  }
  validate(type: "version" | "distribution" | "assets" | "libraries" | "files" | "forge"): void {
    this.view.send({ type: "validate", payload: type });
  }
  complate(type: "install"): void {
    this.view.send({ type: "complate", payload: type });
  }
  assetsProgress(total: number, progress: number): void {
    this.view.send({
      type: "progress",
      payload: { type: "assets", total, progress },
    });
  }
  downloadProgress(total: number, progress: number): void {
    this.view.send({
      type: "progress",
      payload: { type: "download", total, progress },
    });
  }
  close(manualData?: Artifact[] | undefined): void {
    this.view.send({
      type: "close",
      payload: manualData,
    });
  }
  error(e: unknown): void {
    this.view.send({
      type: "error",
      payload: e,
    });
  }
}
