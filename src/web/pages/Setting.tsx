import { css } from "@emotion/react";
import { useAtom } from "jotai";
import { SwitchTransition } from "react-transition-group";
import Fade from "../components/Fade";
import About from "./Setting/About";
import Account from "./Setting/Account";
import Java from "./Setting/Java";
import Launcher from "./Setting/Launcher";
import Menu from "./Setting/Menu";
import Minecraft from "./Setting/Minecraft";
import Mod from "./Setting/Mod";
import { SettingJotai, settingJotai } from "./Setting/settingJotai";
import Update from "./Setting/Update";

export default function Setting() {
  const [setting] = useAtom(settingJotai);
  return (
    <div css={styles.root}>
      <Menu />
      <div css={styles.pageContainer}>
        <SwitchTransition>{settingComp(setting)}</SwitchTransition>
      </div>
    </div>
  );
}

function settingComp(setting: SettingJotai) {
  switch (setting) {
    case "account":
      return (
        <Fade key="account">
          <Account />
        </Fade>
      );
    case "minecraft":
      return (
        <Fade key="minecraft">
          <Minecraft />
        </Fade>
      );
    case "mod":
      return (
        <Fade key="mod">
          <Mod />
        </Fade>
      );
    case "java":
      return (
        <Fade key="java">
          <Java />
        </Fade>
      );
    case "launcher":
      return (
        <Fade key="launcher">
          <Launcher />
        </Fade>
      );
    case "about":
      return (
        <Fade key="about">
          <About />
        </Fade>
      );
    case "update":
      return (
        <Fade key="update">
          <Update />
        </Fade>
      );
    default:
      return <div key="never"></div>;
  }
}

const styles = {
  root: css`
    height: calc(100vh - 24px);
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
  `,
  pageContainer: css`
    height: 100%;
    overflow: auto;
    flex: 1;
    ::-webkit-scrollbar {
      width: 20px;
    }
    ::-webkit-scrollbar-corner {
      background: rgba(0, 0, 0, 0);
    }
    ::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 6px;
      border: 4px solid rgba(0, 0, 0, 0);
      background-clip: content-box;
      min-width: 32px;
      min-height: 32px;
    }
    ::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0);
    }
  `,
};
