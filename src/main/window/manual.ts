import { BrowserWindow } from "electron";
import path from "path";
import fs from "fs-extra";
import { Artifact } from "../distribution/artifact";
import { getPlatformIcon } from "@/assets/ts";
import { SealCircleSet } from "@/assets/ts/main";
import { paths } from "../utils/paths";
import { validateLocal } from "../downloader/helper";
import { ManualRendererChannel } from "../utils/channels";

export class ManualWindowManager {
  private static instance?: ManualWindowManager;
  static get INSTANCE() {
    if (ManualWindowManager.instance != null) return ManualWindowManager.instance;
    return (ManualWindowManager.instance = new ManualWindowManager());
  }
  manualWindows: ({ win: BrowserWindow; manual: Artifact; preventRedirect: boolean } | undefined)[] = [];
}
export function openManualWindow(artifacts: Artifact[]) {
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
