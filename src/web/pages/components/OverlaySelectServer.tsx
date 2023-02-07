import { useAtom, useAtomValue } from "jotai";
import Overlay from "./Overlay";
import { overlaySelectServerJotai } from "../jotai/overlaySelectServerJotai";
import { css } from "@emotion/react";
import { mainPreload } from "../../utils/preload";
import { actions } from "../../../common/actions";

export default function OverlaySelectServer() {
  const [overlaySelectServer, setOverlay] = useAtom(overlaySelectServerJotai);
  mainPreload.state.dispatch(actions.overlay.selectServer("hogehoge"));
  return (
    <Overlay in={overlaySelectServer}>
      <div css={styles.container}>
        <div>利用可能なmodpack</div>
        <div></div>
        <button onClick={() => setOverlay(false)}>close</button>
      </div>
    </Overlay>
  );
}

const styles = {
  container: css`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
};
