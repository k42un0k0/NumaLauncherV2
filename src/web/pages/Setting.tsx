import { useAtom } from "jotai";
import { SwitchTransition } from "react-transition-group";
import Fade from "../components/Fade";
import About from "./Setting/About";
import Account from "./Setting/Account";
import Java from "./Setting/Java";
import Launcher from "./Setting/Launcher";
import Minecraft from "./Setting/Minecraft";
import Mod from "./Setting/Mod";
import { SettingJotai, settingJotai } from "./Setting/settingJotai";
import Update from "./Setting/Update";

export default function Setting() {
  const [setting, setSetting] = useAtom(settingJotai);
  return (
    <div>
      <div>設定</div>
      <div>
        <div>
          <button onClick={() => setSetting("account")}>アカウント</button>
          <button onClick={() => setSetting("minecraft")}>Minecraft</button>
          <button onClick={() => setSetting("mod")}>Mod</button>
          <button onClick={() => setSetting("java")}>Java</button>
          <button onClick={() => setSetting("launcher")}>ランチャー</button>
          <button onClick={() => setSetting("about")}>about</button>
          <button onClick={() => setSetting("update")}>アップデート</button>
        </div>
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
