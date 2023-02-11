import { css } from "@emotion/react";
import { useAtom } from "jotai";
import { usePageMove } from "../utils/pageJotai";
import { settingJotai } from "./utils/settingJotai";

export default function Menu() {
  const [settting, setSetting] = useAtom(settingJotai);
  const pageMove = usePageMove();
  return (
    <div css={styles.root}>
      <div css={styles.heading}>設定</div>
      <button
        css={[styles.button, settting == "account" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("account")}
      >
        アカウント
      </button>
      <button
        css={[styles.button, settting == "minecraft" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("minecraft")}
      >
        Minecraft
      </button>
      <button
        css={[styles.button, settting == "mod" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("mod")}
      >
        Mod
      </button>
      <button
        css={[styles.button, settting == "java" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("java")}
      >
        Java
      </button>
      <button
        css={[styles.button, settting == "launcher" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("launcher")}
      >
        ランチャー
      </button>
      <div css={styles.spacer} />
      <button
        css={[styles.button, settting == "about" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("about")}
      >
        About
      </button>
      <button
        css={[styles.button, settting == "update" ? styles.buttonActive : styles.buttonDeactive]}
        onClick={() => setSetting("update")}
      >
        アップデート
      </button>
      <div css={styles.spacer} />
      <div css={styles.divider} />

      <button css={[styles.button, styles.closeButton]} onClick={() => pageMove.home()}>
        閉じる
      </button>
    </div>
  );
}

const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    padding: 0px 80px;
  `,
  heading: css`
    font-size: 1.25rem;
    padding-left: 20px;
    padding-bottom: 40px;
  `,
  button: css`
    display: block;
    margin: 8px 0;
    text-align: left;
    color: grey;
    transition: 0.25s ease;
  `,
  buttonDeactive: css`
    :hover {
      color: #c1c1c1;
      text-shadow: 0px 0px 20px #c1c1c1;
    }
  `,
  buttonActive: css`
    color: white;
  `,
  closeButton: css`
    color: white;
    :hover {
      color: white;
      text-shadow: 0px 0px 20px white;
    }
  `,
  spacer: css`
    height: 30px;
  `,
  divider: css`
    margin-bottom: 25px;
    height: 1px;
    width: 75%;
    background-color: grey;
  `,
};
