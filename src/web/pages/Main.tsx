import { useEffect } from "react";
import { SwitchTransition } from "react-transition-group";
import Fade from "../components/Fade";
import { mainPreload } from "../utils/preload";
import { useAtom } from "jotai";
import { pageJotai, PageJotai } from "./pageJotai";
import Landing from "./Landing";
import Login from "./Login";
import Setting from "./Setting";
import Frame from "./Frame";
import { css } from "@emotion/react";
import { backgroundImages } from "../../assets/ts/web";

export const Main = () => {
  const [page] = useAtom(pageJotai);
  useEffect(() => {
    const removeEventListeners: (() => void)[] = [];
    removeEventListeners.push(
      mainPreload.login.onCloseMSALoginWindow((state) => {
        console.log(state);
      })
    );
    removeEventListeners.push(
      mainPreload.login.onFetchMSAccount((account) => {
        console.log(account);
      })
    );
    return () => {
      removeEventListeners.forEach((f) => f());
    };
  });

  return (
    <div css={[styles.root]}>
      <div css={styles.container}>
        <Frame />
        <div css={styles.main}>
          <SwitchTransition>{mainComp(page)}</SwitchTransition>
        </div>
      </div>
    </div>
  );
};
function mainComp(page: PageJotai) {
  switch (page) {
    case "home":
      return (
        <Fade key="home">
          <Landing />
        </Fade>
      );
    case "login":
      return (
        <Fade key="login">
          <Login />
        </Fade>
      );
    case "setting":
      return (
        <Fade key="setting">
          <Setting />
        </Fade>
      );
    default:
      return <div key="never"></div>;
  }
}

const styles = {
  root: css`
    background-size: cover;
    background-image: url(${backgroundImages[Math.floor(Math.random() * backgroundImages.length)]});
    height: 100vh;
  `,
  container: css`
    height: 100%;
  `,
  main: css`
    height: calc(100% - 24px);
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.65) 100%);
  `,
};
