import { css, keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import SealCircle from "../../../assets/images/SealCircle.svg";
import { useMainPreload } from "@/web/utils/preload";
import Overlay from "../components/Overlay";
import { usePageMove } from "../utils/pageJotai";
import { useSelector } from "../utils/stateJotai";
import { selectors } from "../utils/selectors";

export default function Login() {
  const mainPreload = useMainPreload();
  const [open, setOpen] = useState(false);
  const [msaLoginState, setMsaLoginState] = useState("waiting");
  const account = useSelector(selectors.account);
  const pageMove = usePageMove();
  useEffect(() => {
    const removeEventListeners: (() => void)[] = [];
    removeEventListeners.push(
      mainPreload.onCloseMSALoginWindow((state) => {
        if (state === "success") {
          return;
        }
        setMsaLoginState("error");
      }),
      mainPreload.onLoginMsa((state) => {
        if (state === "success") {
          if (account) pageMove.setting();
          else pageMove.home();
          setOpen(false);
          return;
        }
        setMsaLoginState("error");
      })
    );
    return () => {
      removeEventListeners.forEach((f) => f());
    };
  }, []);
  return (
    <div css={styles.root}>
      {account && (
        <button css={styles.main.closeButton} onClick={() => pageMove.setting()}>
          <div css={styles.main.closeIcon}>X</div>
          <div>Cancel</div>
        </button>
      )}
      <div css={[styles.main.root, open && styles.main.rootOpenOverlay]}>
        <img src={SealCircle} css={styles.image} />
        <div css={styles.main.clickhere}>↓ CLICK HERE ! ↓</div>
        <button
          css={styles.main.loginButton}
          onClick={() => {
            setOpen(true);
            setMsaLoginState("waiting");
            mainPreload.openMSALoginWindow();
          }}
        >
          Microsoft Login
        </button>
        <a css={styles.main.link} href="https://www.minecraft.net/en-us/store/minecraft-java-edition">
          Need an Account?
        </a>
        <div css={styles.main.small}>パスワードは直接Microsoftに送信され、保存されることはありません。</div>
        <div css={styles.main.small}>沼ランチャーは Microsoftとは関係ありません。</div>
      </div>
      <Overlay in={open}>
        <div css={styles.overlay.container}>
          {msaLoginState === "waiting" ? (
            <>
              <div css={styles.overlay.loader}></div>
              <span css={styles.overlay.detail}>Waiting on Microsoft...</span>
            </>
          ) : msaLoginState === "error" ? (
            <>
              <div css={styles.overlay.errorTitle}>ERROR</div>
              <div css={styles.overlay.errorDetail}>
                NumaLauncherを使用するには、ログインが必要です。ログインに成功すると、ウィンドウは自動的に閉じます。
              </div>
              <button css={styles.overlay.close} onClick={() => setOpen(false)}>
                OK
              </button>
            </>
          ) : (
            <></>
          )}
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
  upDown: keyframes`
  0% {
    transform: translateY(3px);
  }
  100% {
      transform: translateY(-3px);
  }
  `,
};
const styles = {
  root: css`
    height: calc(100vh - 24px);
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
  `,
  main: {
    root: css`
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `,
    closeButton: css`
      position: absolute;
      right: 50px;
      top: 50px;
      text-align: center;
    `,
    closeIcon: css`
      border-radius: 50%;
      border: 1px solid white;
      box-sizing: border-box;
      height: 30px;
      width: 30px;
      font-size: 19px;
      line-height: 30px;
      margin: 0 auto;
      margin-bottom: 5px;
      transition: 0.25s ease;
      :hover,
      :focus {
        text-shadow: 0px 0px 20px white;
      }
      :hover,
      :focus {
        box-shadow: 0px 0px 20px white;
      }
      :active {
        text-shadow: 0px 0px 20px rgba(255, 255, 255, 0.75);
        color: rgba(255, 255, 255, 0.75);
        border-color: rgba(255, 255, 255, 0.75);
      }
      :active {
        box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.75);
      }
    `,
    rootOpenOverlay: css`
      filter: blur(3px) contrast(0.9) brightness(1);
    `,
    clickhere: css`
      animation: ${animations.upDown} 1s ease-in-out infinite alternate;
    `,
    loginButton: css`
      background: none;
      background-color: rgb(255, 255, 255, 0);
      margin-top: 20px;
      margin-bottom: 20px;
      font-size: 23px;
      padding: 5px 0;
      border: 2px solid rgba(255, 255, 255, 0.6);
      border-radius: 30px;
      width: 220px;
      transition: ease 0.6s;
      :hover {
        color: black;
        background-color: white;
      }
    `,
    link: css`
      transform: scale(0.7);
      font-size: 10px;
      color: #848484;
      :focus {
        color: #a2a2a2;
      }
    `,
    small: css`
      transform: scale(0.7);
      font-size: 10px;
      color: #848484;
    `,
  },
  image: css`
    height: 125px;
    width: 125px;
    margin-bottom: 20px;
  `,
  overlay: {
    container: css`
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `,
    loader: css`
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
    detail: css`
      font-size: 2em;
    `,
    errorTitle: css`
      font-weight: bold;
    `,
    errorDetail: css`
      font-size: 10px;
      width: 240px;
      margin: 20px 0 10px;
      text-align: center;
    `,
    close: css`
      border-radius: 2px;
      border: 1px solid white;
      padding: 2px 5px;
      font-size: 10px;
    `,
  },
};
