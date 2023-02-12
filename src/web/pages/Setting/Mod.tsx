import { useSetAtom } from "jotai";
import { SwitchTransition } from "react-transition-group";
import Fade from "../components/Fade";
import { overlaySelectServerJotai } from "../utils/overlaySelectServerJotai";
import { settingSelectors } from "../utils/selectors";
import { useSelector } from "../utils/stateJotai";
import Dnd from "./components/Dnd";
import Mods from "./Mod/Mods";

export default function Mod() {
  const mod = useSelector(settingSelectors.mod);
  const setOverlay = useSetAtom(overlaySelectServerJotai);
  return (
    <SwitchTransition>
      <Fade key={mod.selectedServer}>
        <div>
          <span>Mod設定</span>
          <span>ModをON/OFFできます。</span>
        </div>
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
            <div>ドロップ・イン Mod</div>
            <Dnd>
              + Modをフォルダに入れ、<span>(F5を押してリロードしてください)</span>
            </Dnd>
            <div></div>
          </div>
          <div>
            <div>シェーダーパック</div>
            <div>ShadersPackを追加・管理できます</div>
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
