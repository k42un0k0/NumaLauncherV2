import { css, keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import { usePageMove } from "./utils/pageJotai";
import SealCircle from "../../assets/images/SealCircle.svg";
import Overlay from "./components/Overlay";
import { useMainPreload } from "../utils/preload";
export default function Login() {
  const mainPreload = useMainPreload();
  const [open, setOpen] = useState(false);
  const pageMove = usePageMove();
  useEffect(() => {
    const removeEventListeners: (() => void)[] = [];
    removeEventListeners.push(
      mainPreload.onCloseMSALoginWindow((state) => {
        if (state === "success") {
          pageMove.home();
        }
      })
    );
    return () => {
      removeEventListeners.forEach((f) => f());
    };
  }, []);
  return (
    <div css={styles.root}>
      <div css={[styles.main.root, open && styles.main.rootOpenOverlay]}>
        <img src={SealCircle} css={styles.image} />
        <div>↓ CLICK HERE ! ↓</div>
        <button
          onClick={() => {
            setOpen(true);
            mainPreload.openMSALoginWindow();
          }}
        >
          Microsoft Login
        </button>
        <div>
          <span>
            <a href="https://www.minecraft.net/en-us/store/minecraft-java-edition">Need an Account?</a>
          </span>
          <p>パスワードは直接Microsoftに送信され、保存されることはありません。</p>
          <p>沼ランチャーは Microsoftとは関係ありません。</p>
        </div>
      </div>
      <Overlay in={open}>
        <div css={styles.overlay.container}>
          <div>
            <div css={styles.overlay.loader}></div>
            <span>Waiting on Microsoft...</span>
          </div>
        </div>
      </Overlay>
    </div>
  );
}

const animations = {
  spin: keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
  `,
};
const styles = {
  root: css`
    height: calc(100vh - 24px);
    background-color: rgba(0, 0, 0, 0.5);
    display:flex; 
    align-items:center;
    justify-content:center:
  `,
  main: {
    root: css`
      height: 100%;
    `,
    rootOpenOverlay: css`
      filter: blur(3px) contrast(0.9) brightness(1);
    `,
  },
  image: css`
    height: 125px;
    width: 125px;
    margin-bottom: 20px;
  `,
  overlay: {
    container: css``,
    loader: css`
      margin: auto;
      border: 5px solid rgba(255, 255, 255, 0.5);
      border-left-color: #ffffff;
      animation-name: ${animations.spin};
      animation-duration: 1s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      position: relative;
      display: block;
      align-self: center;
      border-radius: 50%;
      width: 60px;
      height: 60px;
    `,
  },
};
