import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs-extra";
import { Artifact } from "../distribution/artifact";
import { getPlatformIcon } from "@/assets/ts";
import { SealCircleSet } from "@/assets/ts/main";
import { paths } from "../utils/paths";
import { validateLocal } from "../downloader/helper";
const downloadDirectory = path.join(app.getPath("temp"), "NumaLauncher", "ManualDownloads");

app.on("quit", () => {
  // tmpディレクトリお掃除
  fs.removeSync(downloadDirectory);
});

export function openManualWindow(artifacts: Artifact[]) {
  let manualWindowIndex = 0;
  const manualWindows = {} as any;
  for (const manual of artifacts) {
    const index = ++manualWindowIndex;
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      icon: getPlatformIcon(SealCircleSet),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(paths.manualPreloadFile),
      },
    });
    manualWindows[index] = {
      win,
      manual,
      preventRedirect: false,
    };

    // セキュリティポリシー無効化
    win.webContents.session.webRequest.onHeadersReceived((d, c) => {
      if (d.responseHeaders!["Content-Security-Policy"]) {
        delete d.responseHeaders!["Content-Security-Policy"];
      } else if (d.responseHeaders!["content-security-policy"]) {
        delete d.responseHeaders!["content-security-policy"];
      }

      c({ cancel: false, responseHeaders: d.responseHeaders });
    });

    // ウィンドウ開いた直後(ページ遷移時を除く)のみ最初のダイアログ表示
    win.webContents.send("manual-first");
    // ロードが終わったら案内情報のデータをレンダープロセスに送る
    win.webContents.on("dom-ready", () => {
      if (win.isDestroyed()) return;
      win.webContents.send("manual-data", manual, index);
    });
    // リダイレクトキャンセル
    win.webContents.on("will-navigate", (event, args) => {
      if (win.isDestroyed()) return;
      const window = manualWindows[index];
      if (window !== undefined) {
        if (window.preventRedirect) event.preventDefault();
      }
    });
    // ダウンロードされたらファイル名をすり替え、ハッシュチェックする
    win.webContents.session.on("will-download", (event, item, webContents) => {
      if (win.isDestroyed()) return;

      downloadIndex++;

      // 一時フォルダに保存
      item.setSavePath(path.join(downloadDirectory, item.getFilename()));

      // 進捗を送信 (開始)
      win.webContents.send("download-start", {
        index: downloadIndex,
        name: manual.manual.name,
        received: item.getReceivedBytes(),
        total: item.getTotalBytes(),
      });
      // 進捗を送信 (進行中)
      item.on("updated", (event, state) => {
        if (win.isDestroyed()) return;
        win.webContents.send("download-progress", {
          index: downloadIndex,
          name: manual.manual.name,
          received: item.getReceivedBytes(),
          total: item.getTotalBytes(),
        });
      });
      // 進捗を送信 (完了)
      item.once("done", (event, state) => {
        if (win.isDestroyed()) return;
        // ファイルが正しいかチェックする
        const v = item.getTotalBytes() === manual.size && validateLocal(item.getSavePath(), "md5", manual.MD5);
        if (!v) {
          // 違うファイルをダウンロードしてしまった場合
          win.webContents.send("download-end", {
            index: downloadIndex,
            name: manual.manual.name,
            state: "hash-failed",
          });
        } else if (fsExtra.existsSync(manual.path)) {
          // ファイルが既にあったら閉じる
          win.close();
        } else {
          // ファイルを正しい位置に移動
          fsExtra.moveSync(item.getSavePath(), manual.path);
          // 完了を通知
          win.webContents.send("download-end", {
            index: downloadIndex,
            name: manual.manual.name,
            state,
          });
        }
      });
    });
    // ダウンロードサイトを表示
    win.loadURL(manual.manual.url);
  }
}
