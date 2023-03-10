import { WebContents } from "electron";
import { Artifact } from "../entities/distribution/artifact";
import { RunMinecraftOB } from "../usecases/runMinecraft";
import { RendererChannel } from "../utils/channels";

export class RunMinecraftPresenter implements RunMinecraftOB {
  constructor(private sender: WebContents) {}
  validate(type: "version" | "distribution" | "assets" | "libraries" | "files" | "forge"): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "validate", payload: type });
  }
  complate(type: "install"): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, { type: "complate", payload: type });
  }
  assetsProgress(total: number, progress: number): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, {
      type: "progress",
      payload: { type: "assets", total, progress },
    });
  }
  downloadProgress(total: number, progress: number): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, {
      type: "progress",
      payload: { type: "download", total, progress },
    });
  }
  close(manualData?: Artifact[] | undefined): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, {
      type: "close",
      payload: manualData,
    });
  }
  error(e: unknown): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, {
      type: "error",
      payload: e,
    });
  }
}
