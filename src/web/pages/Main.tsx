import { useEffect } from "react";
import { SwitchTransition } from "react-transition-group";
import Fade from "./components/Fade";
import { mainPreload } from "../utils/preload";
import { useAtom, useSetAtom } from "jotai";
import { pageJotai, PageJotai, usePageMove } from "./utils/pageJotai";
import Landing from "./Landing";
import Login from "./Login";
import Setting from "./Setting";
import Frame from "./components/Frame";
import { css } from "@emotion/react";
import { backgroundImages } from "../../assets/ts/web";
import Splash from "./Splash";
import OverlaySelectServer from "./OverlaySelectServer";
import { stateJotai } from "./utils/stateJotai";
import { landingSelectors } from "./Landing/utils/selectors";

export const Main = () => {
  const setState = useSetAtom(stateJotai);

  const pageMove = usePageMove();
  useEffect(() => {
    async function effect() {
      await Promise.all([mainPreload.config.load(), mainPreload.distribution.load()]);
      const state = await mainPreload.view.getState();
      setState(state);
      console.log(state);
      if (landingSelectors.account(state)) {
        pageMove.home();
        return;
      }
      pageMove.login();
    }
    effect();
  }, []);
  const [page] = useAtom(pageJotai);
  return (
    <div css={[styles.root]}>
      <div css={styles.container}>
        <Frame />
        <div css={styles.main}>
          <SwitchTransition>{mainComp(page)}</SwitchTransition>
          <OverlaySelectServer />
        </div>
      </div>
    </div>
  );
};
function mainComp(page: PageJotai) {
  switch (page) {
    case "splash":
      return (
        <Fade key="splash">
          <Splash />
        </Fade>
      );
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
    position: relative;
    height: calc(100% - 24px);
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.65) 100%);
  `,
};
