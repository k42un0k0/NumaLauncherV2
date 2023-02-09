import { css } from "@emotion/react";
import { useState } from "react";
import DashBoard from "./Landing/DashBoard";
import Skin from "./Landing/Skin";

export default function Home() {
  const [skin, setSkin] = useState(false);
  return (
    <div css={styles.root}>
      <button
        css={[styles.skinButton, skin && styles.skinButtonActive]}
        onClick={() => {
          setSkin(!skin);
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
      <DashBoard in={skin} />
      <Skin in={skin} />
    </div>
  );
}
const styles = {
  root: css`
    height: calc(100vh - 24px);
    position: relative;
    overflow: hidden;
  `,
  skinButton: css`
    color: white;
    border: none;
    background-color: transparent;
    z-index: 1;
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    transition: 2s ease;
    letter-spacing: 2px;
    font-size: 11px;
  `,
  skinButtonActive: css`
    bottom: 90%;
  `,
};
