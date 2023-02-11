import { css } from "@emotion/react";
import { useEffect } from "react";
import Gear from "../components/Icon/Gear";
import { SkinViewer, WalkingAnimation } from "skinview3d";
import { useSelector } from "../utils/stateJotai";
import { landingSelectors } from "../utils/selectors";
import { getCurrentSkin } from "@/web/utils/api/mojang";
type Props = {
  onClickGear: () => void;
};
export default function Skin({ onClickGear }: Props) {
  const account = useSelector(landingSelectors.account);
  useEffect(() => {
    async function effect() {
      const a = await getCurrentSkin(account!.uuid);
      const skinViewer = new SkinViewer({
        canvas: document.getElementById("skin_container") as HTMLCanvasElement,
        width: 300,
        height: 400,
        skin: a.skinURL,
      });
      const skinModel = a.model == "classic" ? "default" : "slim";
      skinViewer.loadSkin(a.skinURL, { model: skinModel });

      // Control objects with your mouse!
      const control = skinViewer.controls;
      control.enableRotate = true;
      control.enableZoom = false;
      control.enablePan = false;

      const anime = new WalkingAnimation();
      anime.speed = 0.55;
      skinViewer.animation = anime;
    }

    effect();
  }, []);
  return (
    <div css={styles.container}>
      <div css={styles.section}>
        <div css={styles.heading}>現在の設定</div>
        <canvas id="skin_container"></canvas>
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
