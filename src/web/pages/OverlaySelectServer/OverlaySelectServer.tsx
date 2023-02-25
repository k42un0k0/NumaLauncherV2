import { useAtom } from "jotai";
import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { overlaySelectServerJotai } from "../utils/overlaySelectServerJotai";
import { overlaySelectors } from "../utils/selectors";
import { actions } from "@/common/actions";
import Overlay from "../components/Overlay";
import { useSelector, useDispatch } from "../utils/stateJotai";

export default function OverlaySelectServer() {
  const [overlaySelectServer, setOverlay] = useAtom(overlaySelectServerJotai);
  const servers = useSelector(overlaySelectors.servers);
  const selectedServer = useSelector(overlaySelectors.selectedServer);
  const [selectedValue, setValue] = useState(selectedServer);
  useEffect(() => {
    setValue(selectedServer);
  }, [selectedServer]);
  const dispatch = useDispatch();
  return (
    <Overlay in={overlaySelectServer}>
      <div css={styles.container}>
        <div>利用可能なmodpack</div>
        <div css={styles.serverList}>
          {servers.map((server) => {
            return (
              <button
                key={server.id}
                onClick={() => {
                  setValue(server.id);
                }}
                css={[styles.button, selectedValue === server.id && styles.selectedServer]}
              >
                <img src={server.icon} css={styles.serverIcon} />
                <div>
                  <div>
                    <span>{server.id}</span>
                    <span dangerouslySetInnerHTML={{ __html: server.description }} />
                    <div></div>
                    <div>{server.minecraftVersion}</div>
                    <div>{server.version}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            dispatch(actions.overlay.selectServer(selectedValue));
            setOverlay(false);
          }}
        >
          選択
        </button>
        <button onClick={() => setOverlay(false)}>close</button>
      </div>
    </Overlay>
  );
}

const styles = {
  container: css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  button: css`
    border: none;
    padding: 0px;
    width: 375px;
    min-height: 60px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    opacity: 0.6;
    transition: 0.25s ease;
    cursor: pointer;
    position: relative;
    background: rgba(131, 131, 131, 0.25);
  `,
  serverList: css`
    height: 70%;
    overflow: auto;
  `,
  serverIcon: css`
    margin: 0px 10px 0px 5px;
    border: 1px solid #fff;
    height: 50px;
    width: 50px;
    flex-shrink: 0;
  `,
  selectedServer: css`
    opacity: 1;
  `,
};
