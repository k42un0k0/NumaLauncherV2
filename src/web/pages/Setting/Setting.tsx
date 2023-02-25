import { useAtom } from "jotai";
import Fade from "../components/Fade";
import Account from "./Account";
import Mod from "./Mod";
import { SettingJotai, settingJotai } from "./utils/settingJotai";
import { SwitchTransition } from "react-transition-group";
import Container from "./components/Container";
import Minecraft from "./Minecraft";
import About from "./About";
import Update from "./Update";
import Launcher from "./Launcher";
import Java from "./Java";

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
