import { useAtom } from "jotai";
import Fade from "./components/Fade";
import About from "./Setting/About";
import Account from "./Setting/Account";
import Container from "./Setting/Container";
import Java from "./Setting/Java";
import Launcher from "./Setting/Launcher";
import Minecraft from "./Setting/Minecraft";
import Mod from "./Setting/Mod";
import { SettingJotai, settingJotai } from "./Setting/utils/settingJotai";
import Update from "./Setting/Update";
import { SwitchTransition } from "react-transition-group";

export default function Setting() {
  const [setting] = useAtom(settingJotai);
  return (
    <Container>
      <SwitchTransition>{settingComp(setting)}</SwitchTransition>
    </Container>
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
