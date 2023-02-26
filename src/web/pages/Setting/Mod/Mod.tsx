import Fade from "@/web/pages/components/Fade";
import { overlaySelectServerJotai } from "@/web/pages/utils/overlaySelectServerJotai";
import { settingSelectors } from "@/web/pages/utils/selectors";
import { useSelector } from "@/web/pages/utils/stateJotai";
import { css } from "@emotion/react";
import { useSetAtom } from "jotai";
import { SwitchTransition } from "react-transition-group";
import Dnd from "../components/Dnd";
import Head from "../components/Head";
import Mods from "./Mods";

export default function Mod() {
  const mod = useSelector(settingSelectors.mod);
  const setOverlay = useSetAtom(overlaySelectServerJotai);
  return (
    <SwitchTransition>
      <Fade key={mod.selectedServer}>
        <Head head="Mod設定" description="ModをON/OFFできます。" />
        <div>
          <div></div>
          <div>
            <div>
              <button onClick={() => setOverlay(true)}>Switch</button>
            </div>
          </div>
        </div>
        <div>
          <Mods mod={mod} />
          <div>
            <div css={styles.fieldHead}>ドロップ・イン Mod</div>
            <Dnd>
              + Modをフォルダに入れ、<span>(F5を押してリロードしてください)</span>
            </Dnd>
            <div></div>
          </div>
          <div>
            <div css={styles.fieldHead}>シェーダーパック</div>
            <div css={styles.fieldDescription}>ShadersPackを追加・管理できます</div>
            <div>
              <button> + </button>
              <div>
                <div>シェーダーパック選択</div>
                <div hidden></div>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </SwitchTransition>
  );
}

const styles = {
  head: css``,
  description: css``,
  fieldHead: css``,
  fieldDescription: css``,
};
