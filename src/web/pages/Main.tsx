import { useEffect, useState } from "react";
import { SwitchTransition } from "react-transition-group";
import Fade from "../components/Fade";
import { mainPreload } from "../utils/preload";
import { useAtom } from "jotai";
import { pageJotai, PageJotai } from "./pageJotai";
import Home from "./Home";
import Login from "./Login";
import Setting from "./Setting";
import Frame from "./Frame";
import { css } from "@emotion/react";
import { backgroundImages } from "../../assets/ts/web";

export const Main = () => {
  const [page, setPage] = useAtom(pageJotai);
  const [count, setCount] = useState(0);
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
      <div>
        <Frame />

        <h1>{count}</h1>
        <button onClick={() => setCount((count) => count + 1)}>Count</button>
        <button
          onClick={() =>
            mainPreload.login.openMSALoginWindow().then((state) => {
              console.log(state);
            })
          }
        >
          aaa
        </button>

        <button onClick={() => setPage("home")}>home</button>
        <button onClick={() => setPage("login")}>login</button>
        <button onClick={() => setPage("setting")}>setting</button>
        <SwitchTransition>{mainComp(page)}</SwitchTransition>
      </div>
    </div>
  );
};
function mainComp(page: PageJotai) {
  switch (page) {
    case "home":
      return (
        <Fade key="home">
          <Home />
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
};
