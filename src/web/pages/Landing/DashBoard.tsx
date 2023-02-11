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
        <div>
          <button>
            <div>PLAY</div>
            <div>▲ゲーム開始</div>
          </button>
          <div></div>
          <button onClick={() => setOverlay(true)}>
            <div>&#8226; Modパックが選択されていません</div>
            <div>▲Modパック/バージョン選択</div>
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
  `,
};
