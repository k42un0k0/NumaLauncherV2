import { ipcRenderer } from "electron";
import { Artifact } from "./entities/distribution/artifact";
import { ManualRendererChannel } from "./utils/channels";

let artifact: Artifact | undefined;
ipcRenderer.on(ManualRendererChannel.DATA, (_, artifactProp: Artifact) => {
  artifact = artifactProp;
});
window.addEventListener("load", () => {
  // jQueryを読み込み
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jQuery = require("jquery");
  //window.jQuery = jQuery

  // アラート用のライブラリ
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Swal = require("sweetalert2");
  let swalContainer: HTMLElement | undefined;
  ipcRenderer.on(ManualRendererChannel.download.START, (_, data) => {
    Swal.fire({
      title: "ダウンロード中",
      html: `${data.name}<p>${(data.received / 1024).toFixed()} / ${(data.total / 1024).toFixed()} KB</p>`,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    });
    swalContainer = Swal.getHtmlContainer().querySelector("p");
  });
  ipcRenderer.on(ManualRendererChannel.download.PROGRESS, (_, data) => {
    swalContainer!.innerText = `${(data.received / 1024).toFixed()} / ${(data.total / 1024).toFixed()} KB`;
  });
  ipcRenderer.on(ManualRendererChannel.download.END, (event, state) => {
    if (state === "completed") {
      // 正常終了
      Swal.fire({
        title: "ダウンロード完了",
        text: "お疲れさまでした",
        icon: "success",
        confirmButtonText: "ウィンドウを閉じる",
        allowOutsideClick: false,
      }).then(() => {
        window.close();
      });
    } else if (state === "hash-failed") {
      // ハッシュ値が違う場合
      Swal.fire({
        title: "違うファイルをダウンロードしています",
        text: "手順をもう一度確認してください",
        icon: "error",
      }).then(() => {
        window.close();
      });
    } else {
      // 失敗
      Swal.fire({
        title: "ダウンロード失敗",
        text: "しばらく時間を置いてもう一度お試しください",
        icon: "error",
      }).then(() => {
        window.close();
      });
    }
  });

  function scopeEval(scope: any, script: string) {
    return Function('"use strict";return (' + script + ")").bind(scope)();
  }

  // YouTube URLからIDを抽出
  function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  }

  // YouTubeの案内を表示
  function openYouTube(url: string) {
    const id = getYouTubeId(url);
    Swal.fire({
      title: "ダウンロードの手順",
      html: `<p>動画の手順に従ってダウンロードしてください</p><iframe width="450" height="256" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    });
  }
  // CSS
  let hintCss = `
        .swal2-container {
            z-index: 1000001;
        }

        .manual-info-button {
            z-index: 1000000;
            padding: 7px;
            display: flex;
            color: black;
            font-family: 'Roboto', arial, helvetica, sans-serif;
            font-size: 14px;
            line-height: 20px;
            align-items: center;
            justify-content: center;
            background-color: white;
            border: 2px solid red;
            border-radius: 5px;
        }

        .manual-info-button:hover {
            background-color: yellow;
            cursor: pointer;
        }

        .manual-info-button-help {
            position: fixed;
            padding-left: 15px;
            bottom: 10px;
            right: 10px;
        }

        .manual-info-button-back {
            position: fixed;
            bottom: 10px;
            left: 10px;
        }

        .manual-info-hint {
            position: relative;
            padding-left: 35px !important;
        }

        .manual-info-hint:before {
            content: "";
            position: absolute;
            width: calc(100% - 4px);
            height: calc(100% - 4px);
            border: 4px solid red;
            top: -2px;
            left: -2px;
            pointer-events: none;
        }

        .manual-info-circle:after {
            content: "";
            position: absolute;
            bottom: -5px;
            left: -10px;
            width: 36px;
            height: 36px;
            background-color: white;
            line-height: 36px;
            font-family: 'Roboto', arial, helvetica, sans-serif;
            font-size: 30px;
            color: red;
            text-align: center;
            vertical-align: middle;
            border-radius: 36px;
            border: 2px solid red;
            pointer-events: none;
        }

        .manual-info-button-help:after {
            content: "?";
            top: -20px;
            left: -20px;
            pointer-events: inherit;
            background-color: inherit;
        }
    `;

  // ヒントを表示
  if (artifact?.manual?.hints !== undefined) {
    const showHints = () => {
      artifact!.manual!.hints!.forEach((hint, hintIndex) => {
        (hint.script ? scopeEval({ jQuery }, hint.script) : jQuery(hint.css))
          .addClass("manual-info-circle")
          .addClass("manual-info-hint")
          .addClass(`manual-info-hint-${hintIndex + 1}`);
      });
    };

    setInterval(showHints, 1000);

    // CSSを追加
    artifact.manual.hints.forEach((hint, hintIndex) => {
      hintCss += `        
                .manual-info-hint-${hintIndex + 1}.manual-info-circle:after {
                    content: "${hintIndex + 1}";
                }
            `;
    });
  }

  // CSSを適用
  jQuery("<style>").html(hintCss).appendTo(jQuery("head"));

  // 戻る
  jQuery("<div>")
    .addClass("manual-info-button")
    .addClass("manual-info-button-back")
    .text("戻る")
    .appendTo(jQuery("body"))
    .on("click", () => {
      history.back();
    });

  // 案内を表示
  if (artifact?.manual?.video !== undefined) {
    jQuery("<div>")
      .addClass("manual-info-button-help")
      .addClass("manual-info-button")
      .addClass("manual-info-circle")
      .text("もう一度やり方を見る")
      .appendTo(jQuery("body"))
      .on("click", () => {
        openYouTube(artifact!.manual!.video!);
      });

    openYouTube(artifact.manual.video);
  }
});
