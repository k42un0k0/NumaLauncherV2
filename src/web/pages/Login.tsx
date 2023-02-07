import { css } from "@emotion/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { mainPreload } from "../utils/preload";
import { usePageMove, useSelectedUUID } from "./pageJotai";

export default function Login() {
  const [selectedUUID, reloadSelectedUUID] = useSelectedUUID();
  const pageMove = usePageMove();
  useEffect(() => {
    const removeEventListeners: (() => void)[] = [];
    removeEventListeners.push(
      mainPreload.login.onCloseMSALoginWindow((state) => {
        if (state === "success") {
          reloadSelectedUUID();
          pageMove.home();
        }
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
  }, []);
  return (
    <div css={styles.root}>
      {selectedUUID && <button onClick={() => pageMove.setting()}>×</button>}
      <button onClick={() => mainPreload.login.openMSALoginWindow()}>microsoft login</button>
    </div>
  );
}

const styles = {
  root: css`
    height: calc(100vh - 24px);
    background-color: rgba(0, 0, 0, 0.5);
  `,
};
