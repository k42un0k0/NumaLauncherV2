import { css } from "@emotion/react";
import SealCircle from "../../../assets/images/SealCircle.svg";
import Statuses from "./DashBoard/Statuses";
import Menu from "./DashBoard/Menu";
import { useSetAtom } from "jotai";
import { overlaySelectServerJotai } from "../utils/overlaySelectServerJotai";
import { useMainPreload } from "@/web/utils/preload";
import { useSelector } from "../utils/stateJotai";
import { landingSelectors } from "../utils/selectors";
import { useState } from "react";
import { serverSelectors } from "../utils/generalSelectors";

export default function DashBoard() {
  const setOverlay = useSetAtom(overlaySelectServerJotai);
  const server = useSelector(landingSelectors.server);
  const mainPreload = useMainPreload();
  const [persentage, setPersentage] = useState<string>();
  const [detail, setDetail] = useState<string>();
  const runMinecraft = () => {
    const cb = mainPreload.onRunMinecraft((type, payload) => {
      switch (type) {
        case "validate":
          switch (payload) {
            case "distribution":
              setPersentage("10");
              setDetail("バージョン情報を読込中..");
              break;
            case "version":
              setPersentage("30");
              setDetail("アセットを検証中..");
              break;
            case "assets":
              setPersentage("60");
              setDetail("ライブラリを検証中..");
              break;
            case "libraries":
              setPersentage("70");
              setDetail("ファイルを検証中..");
              break;
            case "files":
              setPersentage("80");
              setDetail("ファイルをダウンロード中..");
              break;
            case "forge":
              setPersentage("100");
              setDetail("Forgeをインストール中..");
              break;
            default:
              throw new Error("not implemented");
          }
          break;
        case "progress":
          switch (payload.type) {
            case "assets": {
              const perc = Math.floor((payload.progress / payload.total) * 30);
              setPersentage(`${30 + perc}`);
              break;
            }
            case "download":
              console.log(payload.progress, payload.total);
              setPersentage(`${Math.floor((payload.progress / payload.total) * 100)}`);
              break;
            default:
              throw new Error("not implemented");
          }
          break;
        case "complete":
          switch (payload) {
            case "download":
            case "install":
              setDetail("起動の準備中..");
              break;
          }
          break;
        case "close":
          if (payload != null) {
            setPersentage("");
            setDetail("");
            cb();
            return;
          }
          setDetail("準備OK。参加勢集合！！！");
          setPersentage("100");
          setTimeout(() => {
            setPersentage("");
            setDetail("");
          }, 10000);
          cb();
          break;
        case "error":
          if (payload instanceof Error) {
            console.log(payload, payload.stack);
          }
          setPersentage("");
          setDetail("");
          cb();
          break;
        default:
          throw Error("not implemented");
      }
    });
    setPersentage("0");
    mainPreload.runMinecraft();
  };
  return (
    <div css={[styles.container]}>
      <div css={styles.main}>
        <img src={SealCircle} css={styles.logo} />
        <Menu />
      </div>
      <div css={styles.footer}>
        <Statuses />
        <div css={styles.game}>
          {persentage && detail ? (
            <>
              <div style={{ width: 100, textAlign: "right" }} css={styles.play}>
                {persentage}%
              </div>
              <div css={styles.divider}></div>
              <div style={{ width: 160 }}>
                <div
                  style={{
                    width: Number(persentage) + "%",
                    backgroundColor: "white",
                    height: "10px",
                    margin: "5px 0 2px",
                  }}
                ></div>
                <div css={styles.minimumfont}>{detail}</div>
              </div>
            </>
          ) : (
            <>
              <button onClick={runMinecraft}>
                <div css={styles.play}>PLAY</div>
                <div css={styles.minimumfont}>▲ゲーム開始</div>
              </button>
              <div css={styles.divider}></div>
              <div>{detail}</div>
              <button onClick={() => setOverlay(true)} css={styles.server}>
                <div>• {server ? serverSelectors.orderlessName(server) : "Modパックが選択されていません"}</div>
                <div css={styles.minimumfont}>▲Modパック/バージョン選択</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: css`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  main: css`
    display: flex;
    justify-content: space-between;
    padding: 50px 80px 0px;
  `,
  logo: css`
    height: 70px;
  `,

  footer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 100px 50px;
  `,
  game: css`
    display: flex;
  `,
  divider: css`
    height: 30px;
    width: 2px;
    background-color: grey;
    margin: 0 20px;
  `,
  play: css`
    font-size: 20px;
    font-weight: bold;
  `,
  minimumfont: css`
    font-size: 10px;
    transform: scale(0.8);
    text-align: center;
  `,
  server: css`
    font-size: 10px;
  `,
};
