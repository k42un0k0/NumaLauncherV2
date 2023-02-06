import { css } from "@emotion/react";
import { useSetAtom } from "jotai";
import { usePageMove } from "../pageJotai";
import { settingJotai } from "./settingJotai";

export default function Menu() {
  const setSetting = useSetAtom(settingJotai);
  const pageMove = usePageMove();
  return (
    <div css={styles.root}>
      <div>設定</div>
      <button onClick={() => setSetting("account")}>アカウント</button>
      <button onClick={() => setSetting("minecraft")}>Minecraft</button>
      <button onClick={() => setSetting("mod")}>Mod</button>
      <button onClick={() => setSetting("java")}>Java</button>
      <button onClick={() => setSetting("launcher")}>ランチャー</button>
      <button onClick={() => setSetting("about")}>about</button>
      <button onClick={() => setSetting("update")}>アップデート</button>
      <button onClick={() => pageMove.home()}>閉じる</button>
    </div>
  );
}

const styles = {
  root: css`
    display: flex;
    flex-direction: column;
  `,
};
