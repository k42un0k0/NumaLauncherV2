import { css } from "@emotion/react";
import { mainPreload } from "../utils/preload";

export default function Frame() {
  return (
    <div css={styles.root}>
      <button
        css={[styles.buttonDarwin, styles.nodrag, styles.closeDarwin]}
        onClick={() => {
          mainPreload.window.close();
        }}
        tabIndex={-1}
      ></button>
      <button
        css={[styles.buttonDarwin, styles.nodrag, styles.minimizeDarwin]}
        onClick={() => {
          mainPreload.window.minimize();
          (document.activeElement as HTMLElement | null)?.blur();
        }}
        tabIndex={-1}
      ></button>
      <button
        css={[styles.buttonDarwin, styles.nodrag, styles.maximizeDarwin]}
        onClick={() => {
          mainPreload.window.maximize();
          (document.activeElement as HTMLElement | null)?.blur();
        }}
        tabIndex={-1}
      ></button>
    </div>
  );
}

const styles = {
  root: css`
    position: relative;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.85);
    transition: background-color 1s ease;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  `,
  nodrag: css`
    -webkit-app-region: no-drag;
  `,
  buttonDarwin: css`
    height: 12px;
    width: 12px;
    border-radius: 50%;
    border: 0px;
    margin-left: 8px;
    cursor: pointer;
  `,
  closeDarwin: css`
    background-color: #e74c32;
    :hover,
    :focus {
      background-color: #ff9a8a;
    }
    :active {
      background-color: #ff8d7b;
    }
  `,
  minimizeDarwin: css`
    background-color: #fed045;
    :hover,
    :focus {
      background-color: #ffe9a9;
    }

    :active {
      background-color: #ffde7b;
    }
  `,
  maximizeDarwin: css`
    background-color: #96e734;

    :hover,
    :focus {
      background-color: #d6ffa6;
    }

    :active {
      background-color: #bfff76;
    }
  `,
};
