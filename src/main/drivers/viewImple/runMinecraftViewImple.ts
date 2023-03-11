import { RunMinecraftView } from "@/main/adapters/RunMinecraftPresenter";
import { Artifact } from "@/main/entities/distribution/artifact";
import { RendererChannel } from "@/main/utils/channels";
import { WebContents } from "electron";
import { BrowserWindow } from "electron";
import path from "path";
import fs from "fs-extra";
import { getPlatformIcon } from "@/assets/ts";
import { SealCircleSet } from "@/assets/ts/main";
import { validateLocal } from "../../drivers/helper";
import { ManualRendererChannel } from "../../utils/channels";
import { paths } from "../../utils/paths";
import { AssetList } from "@/main/entities/downloader/assetList";
import { forEachOfLimit } from "@/main/utils/util";
import fetch from "node-fetch";
export class RunMinecraftViewImple implements RunMinecraftView {
  constructor(private sender: WebContents) {}
  async processDLQueues(
    assetListData: { assetList: AssetList; limit: number }[],
    onData: (total: number, progress: number) => void
  ): Promise<void> {
    let progress = 0;
    let totalSize = 0;
    for (const item of assetListData) {
      totalSize += item.assetList.dlsize;
    }
    for (const item of assetListData) {
      await forEachOfLimit(item.assetList.dlqueue, item.limit, async (asset) => {
        fs.ensureDirSync(path.join(asset.to, ".."));
        const response = await fetch(asset.from);
        const size = Number(response.headers.get("content-length"));
        if (asset.size != size) {
          totalSize += -asset.size + size;
        }
        const writeStream = fs.createWriteStream(asset.to);
        response.body?.pipe(writeStream);

        response.body?.on("data", (chunk) => {
          progress += chunk.length;
          onData(totalSize, progress);
        });
        return new Promise((resolve) => {
          response.body?.on("close", () => resolve());
        });
      });
    }
  }
  createManualWindows(artifacts: Artifact[]): void {
    artifacts.forEach((manual, index) => {
      const win = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: getPlatformIcon(SealCircleSet),
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(paths.manualPreloadFile),
          partition: `manual-${index}`, // パーティションを分けることでウィンドウを超えてwill-downloadイベント同士が作用しあわない
        },
      });
      win.webContents.on("dom-ready", () => {
        win.webContents.send(ManualRendererChannel.DATA, manual);
      });
      win.webContents.session.on("will-download", (_, item) => {
        // なぜかisDestroyed==trueの状態で実行されることがある
        if (win.isDestroyed()) return;
        item.setSavePath(paths.manualDownloads.$join(item.getFilename()));
        win.webContents.send(ManualRendererChannel.download.START, {
          name: manual.manual!.name,
          received: item.getReceivedBytes(),
          total: item.getTotalBytes(),
        });
        item.on("updated", () => {
          if (win.isDestroyed()) return;
          win.webContents.send(ManualRendererChannel.download.PROGRESS, {
            received: item.getReceivedBytes(),
            total: item.getTotalBytes(),
          });
        });
        // 進捗を送信 (完了)
        item.once("done", (_, state) => {
          if (win.isDestroyed()) return;
          // ファイルが正しいかチェックする
          const v = item.getTotalBytes() === manual.size && validateLocal(item.getSavePath(), "md5", manual.MD5);
          if (!v) {
            // 違うファイルをダウンロードしてしまった場合
            win.webContents.send(ManualRendererChannel.download.END, "hash-failed");
          } else if (fs.existsSync(manual.path)) {
            // ファイルが既にあったら閉じる
            win.close();
          } else {
            // ファイルを正しい位置に移動
            fs.moveSync(item.getSavePath(), manual.path);
            // 完了を通知
            win.webContents.send(ManualRendererChannel.download.END, state);
          }
        });
      });
      // ダウンロードサイトを表示
      win.loadURL(manual.manual?.url || "");
    });
  }
  send(action: { type: string; payload: any }): void {
    this.sender.send(RendererChannel.ON_RUN_MINECRAFT, action);
  }
}
