import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { getCurrentSkin } from "../../utils/api/mojang";
import DashBoard from "./DashBoard";
import EditSkin from "./EditSkin";
import News from "./News";
import Skin from "./Skin";
import { landingSelectors } from "../utils/selectors";
import { useSelector } from "../utils/stateJotai";

export default function Home() {
  const [active, setSkinActive] = useState(false);
  const [open, setOpen] = useState(true);
  const account = useSelector(landingSelectors.account);
  const [currentSkin, setCurrentSkin] = useState<{ skinURL: string; model: "default" | "slim" | undefined }>({
    skinURL: "",
    model: undefined,
  });
  useEffect(() => {
    async function effect() {
      setCurrentSkin(await getCurrentSkin(account!.uuid));
    }
    effect();
  }, []);
  return (
    <div css={styles.root}>
      <div css={[styles.dashboard, active && styles.dashboardDeactive]}>
        <DashBoard />
      </div>
      <div css={[styles.hide, active && styles.active]}>
        <Skin onClickGear={() => setOpen(true)} currentSkin={currentSkin} />
      </div>
      <div css={[styles.skinButtonContainer, active && styles.skinButtonContainerActive]}>
        <button
          css={[styles.skinButton]}
          onClick={() => {
            setSkinActive(!active);
          }}
        >
          <div>
            <svg
              viewBox="0 0 24.87 13.97"
              css={css`
                height: 11px;
              `}
            >
              <polyline
                style={{
                  fill: "none",
                  stroke: "#FFF",
                  strokeWidth: "2px",
                }}
                points="0.71 13.26 12.56 1.41 24.16 13.02"
              />
            </svg>
          </div>
          <div>SKIN</div>
        </button>
      </div>
      <div css={[styles.hide, active && styles.active]}>
        <News open={open} onClickClose={() => setOpen(false)} />
      </div>
      <div css={[styles.skinform]}>
        <EditSkin open={false} onClickClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
const styles = {
  root: css`
    height: calc(100vh - 24px);
    position: relative;
    overflow: hidden;
  `,
  skinButtonContainer: css`
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    transition: 2s ease;
  `,
  skinButtonContainerActive: css`
    bottom: 90%;
  `,
  skinButton: css`
    color: white;
    border: none;
    background-color: transparent;
    letter-spacing: 2px;
    font-size: 11px;
  `,
  skinform: css`
    position: absolute;
    height: 100%;
    top: 0;
  `,
  hide: css`
    position: absolute;
    height: 100%;
    transition: 2s ease;
    transform: translateY(0);
  `,
  active: css`
    transform: translateY(-100%);
  `,
  dashboard: css`
    height: 100%;
    transition: 2s ease;
    transform: translateY(0);
  `,
  dashboardDeactive: css`
    transform: translateY(-200%);
  `,
};
