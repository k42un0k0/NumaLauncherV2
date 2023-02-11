import { css } from "@emotion/react";
import SealCircle from "../../../assets/images/SealCircle.svg";
import Statuses from "./DashBoard/Statuses";
import Menu from "./DashBoard/Menu";
import { useSetAtom } from "jotai";
import { overlaySelectServerJotai } from "../utils/overlaySelectServerJotai";

export default function DashBoard() {
  const setOverlay = useSetAtom(overlaySelectServerJotai);
  return (
    <div css={[styles.container]}>
      <div css={styles.main}>
        <img src={SealCircle} css={styles.logo} />
        <Menu />
      </div>
      <div css={styles.footer}>
        <Statuses />
        <div css={styles.game}>
          <button>
            <div css={styles.play}>PLAY</div>
            <div css={styles.minimumfont}>▲ゲーム開始</div>
          </button>
          <div css={styles.divider}></div>
          <button onClick={() => setOverlay(true)} css={styles.server}>
            <div>&#8226; Modパックが選択されていません</div>
            <div css={styles.minimumfont}>▲Modパック/バージョン選択</div>
          </button>
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
    padding: 100px;
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
  `,
  server: css`
    font-size: 10px;
  `,
};
