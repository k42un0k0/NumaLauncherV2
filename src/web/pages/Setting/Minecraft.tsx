import { css } from "@emotion/react";
import { settingSelectors } from "../utils/selector";
import { useSelector } from "../utils/stateJotai";

export default function Account() {
  const minecraft = useSelector(settingSelectors.minecraft);
  return (
    <div css={styles.root}>
      <div>
        <span>Minecraft設定</span>
        <span>ゲームの起動に関連するオプション</span>
      </div>
      <div>
        <span>ゲーム解像度</span>
        <div>
          <input type="number" min="0" defaultValue={minecraft.resWidth} />
          <div>&#10006;</div>
          <input type="number" min="0" defaultValue={minecraft.resHeight} />
        </div>
      </div>
      <div>
        <div>
          <span>フルスクリーン起動</span>
        </div>
        <div>
          <label>
            <input type="checkbox" defaultChecked={minecraft.fullscreen} />
            <span></span>
          </label>
        </div>
      </div>
      <div>
        <div>
          <span>起動時に自動的にサーバーに接続する</span>
        </div>
        <div>
          <label>
            <input type="checkbox" defaultChecked={minecraft.fullscreen} />
            <span></span>
          </label>
        </div>
      </div>
      <div>
        <div>
          <span>ランチャーとゲームを分離する</span>
          <span>オンにするとランチャーを終了するとゲームも終了します</span>
        </div>
        <div>
          <label>
            <input type="checkbox" defaultValue={minecraft.optionStandize + ""} />
            <span></span>
          </label>
        </div>
      </div>
      <div>
        <div>
          <span>設定を共有する</span>
          <span>modパックの初回起動時に、最後に設定を変更したmodパックからMinecraftの設定をコピーします。</span>
        </div>
        <div>
          <label>
            <input type="checkbox" defaultChecked={minecraft.optionStandize} />
            <span></span>
          </label>
        </div>
      </div>
    </div>
  );
}
const styles = {
  root: css`
    flex: 1;
  `,
};
