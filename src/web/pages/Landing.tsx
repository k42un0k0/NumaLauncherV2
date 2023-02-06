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
        skin
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
  `,
  skinButtonActive: css`
    bottom: 90%;
  `,
};
