import { css } from "@emotion/react";
import { settingSelectors } from "../../utils/selectors";
import { useSelector } from "../../utils/stateJotai";
import Head from "../components/Head";
import Switch from "../components/Switch";
import TextInput from "../components/TextInput";

export default function Account() {
  const minecraft = useSelector(settingSelectors.minecraft);
  return (
    <div css={styles.root}>
      <Head head="Minecraft設定" description="ゲームの起動に関連するオプション" />
      <div css={styles.resolutionContainer}>
        <div css={styles.fieldTitle}>ゲーム解像度</div>
        <div css={styles.resolution}>
          <TextInput css={styles.resolutionInput} type="number" min="0" defaultValue={minecraft.resWidth} />
          <div css={styles.resolutionCross}>&#10006;</div>
          <TextInput css={styles.resolutionInput} type="number" min="0" defaultValue={minecraft.resHeight} />
        </div>
      </div>
      <div css={styles.fieldContainer}>
        <div css={styles.fieldTitle}>フルスクリーン起動</div>
        <div>
          <label>
            <Switch value={minecraft.fullscreen} />
            <span></span>
          </label>
        </div>
      </div>
      <div css={styles.fieldContainer}>
        <div css={styles.fieldTitle}>起動時に自動的にサーバーに接続する</div>
        <div>
          <label>
            <Switch value={minecraft.fullscreen} />
            <span></span>
          </label>
        </div>
      </div>
      <div css={styles.fieldContainer}>
        <div>
          <div css={styles.fieldTitle}>ランチャーとゲームを分離する</div>
          <div css={styles.fieldDescription}>オンにするとランチャーを終了するとゲームも終了します</div>
        </div>
        <div>
          <label>
            <Switch value={minecraft.optionStandize} />
          </label>
        </div>
      </div>
      <div css={styles.fieldContainer}>
        <div>
          <div css={styles.fieldTitle}>設定を共有する</div>
          <div css={styles.fieldDescription}>
            modパックの初回起動時に、最後に設定を変更したmodパックからMinecraftの設定をコピーします。
          </div>
        </div>
        <div>
          <label>
            <Switch value={minecraft.optionStandize} />
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
    padding-right: 25%;
  `,
  fieldTitle: css`
    font-size: 14px;
    font-family: "Avenir Medium";
    color: rgba(255, 255, 255, 0.95);
  `,
  fieldDescription: css`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.95);
    margin-top: 5px;
  `,
  fieldContainer: css`
    display: flex;
    justify-content: space-between;
    padding: 20px 0px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  `,
  resolutionContainer: css`
    padding: 20px 0px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  `,
  resolution: css`
    display: flex;
    align-items: center;
    padding-top: 10px;
  `,
  resolutionInput: css`
    padding: 7.5px 5px;
    width: 75px;
    :focus {
      outline: none;
    }
    /* Chrome, Safari, Edge, Opera */
    ::-webkit-outer-spin-button,
    ::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    [type="number"] {
      -moz-appearance: textfield;
    }
  `,
  resolutionCross: css`
    color: grey;
    padding: 0px 15px;
  `,
};
