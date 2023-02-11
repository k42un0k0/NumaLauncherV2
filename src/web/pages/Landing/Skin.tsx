import { css } from "@emotion/react";
import { useEffect } from "react";
import Gear from "../components/Icon/Gear";
import { useSkinViewer } from "./utils/useSkinViewer";
type Props = {
  onClickGear: () => void;
  currentSkin: {
    skinURL: string;
    model: "default" | "slim" | "auto-detect" | undefined;
  };
};
export default function Skin({ onClickGear, currentSkin }: Props) {
  const { viewer, ref } = useSkinViewer();
  useEffect(() => {
    if (!currentSkin.skinURL || !currentSkin.model) {
      return;
    }
    viewer.current?.loadSkin(currentSkin.skinURL, { model: currentSkin.model });
  }, [currentSkin]);
  return (
    <div css={styles.container}>
      <div css={styles.section}>
        <div css={styles.heading}>現在の設定</div>
        <canvas ref={ref}></canvas>
      </div>
      <div css={styles.divider}></div>
      <div css={styles.section}>
        <div>
          <div css={styles.heading}>ライブラリ</div>
          <div css={styles.gearContainer}>
            <button onClick={onClickGear}>
              <Gear css={styles.gear} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: css`
    display: flex;
    padding: 10% 20px;
    width: 100vw;
    height: 100%;
    position: relative;
  `,
  divider: css`
    background-color: #969696;
    width: 1px;
  `,
  section: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  `,
  heading: css`
    margin-bottom: 50px;
    font-weight: bold;
  `,
  gear: css`
    fill: white;
    height: 25px;
  `,
  gearContainer: css`
    position: absolute;
    top: 0;
    right: 0;
  `,
};
