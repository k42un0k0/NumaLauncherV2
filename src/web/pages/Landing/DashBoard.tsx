import { css } from "@emotion/react";
import { useSetAtom } from "jotai";
import { overlaySelectServerJotai } from "../utils/overlaySelectServerJotai";
import SealCircle from "../../../assets/images/SealCircle.svg";
import Statuses from "./DashBoard/Statuses";
import Menu from "./DashBoard/Menu";

type Props = { in: boolean };
export default function DashBoard({ in: inProp }: Props) {
  return (
    <div css={[styles.container, inProp && styles.containerActive]}>
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
          <button>
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
    transition: 2s ease;
    transform: translateY(0);
  `,
  containerActive: css`
    transform: translateY(-200%);
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
