import { css } from "@emotion/react";
import { ChangeEvent, Fragment, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import Fade from "../components/Fade";
import Radio from "../components/Radio";
import CloseButton from "./components/CloseButton";

type Props = {
  open: boolean;
  onClickClose: () => void;
};
export default function News({ open, onClickClose }: Props) {
  const [val, setVal] = useState("true");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
  };
  return (
    <TransitionGroup component={Fragment}>
      {open ? (
        <Fade css={styles.root}>
          <div css={styles.closeButton}>
            <CloseButton onClick={onClickClose} />
          </div>
          <div css={styles.centering}>
            <div css={[styles.centering, styles.margin]}>
              <div css={styles.margin}>
                <strong>沼ランチャーでスキン変更ができるようになりました！</strong>
              </div>
              <div css={styles.margin}>公式ランチャーからスキン情報をインポート！</div>
              <div css={styles.margin}>
                <button css={styles.button}>公式ランチャーからスキン情報をコピーする</button>
              </div>
            </div>
            <p>スキンライブラリを公式と沼ランチャーで同期しますか？</p>
            <div css={[styles.centering, styles.margin]}>
              <div css={[styles.margin, styles.formControl]}>
                <Radio
                  name="syncSkin"
                  value="true"
                  id="syncSkinTrue"
                  onChange={handleChange}
                  checked={val === "true"}
                />
                <label htmlFor="syncSkinTrue">常に同期する</label>
                <Radio
                  type="radio"
                  name="syncSkin"
                  value="false"
                  id="syncSkinFalse"
                  checked={val === "false"}
                  onChange={handleChange}
                />
                <label htmlFor="syncSkinFalse">同期しない</label>
              </div>
              <div css={styles.margin}>
                <button css={styles.button}>スキンの同期・非同期設定を保存する</button>
              </div>
            </div>
            <div css={styles.info}>
              <strong>スキンの削除について</strong>
              <br />
              ・公式ランチャーで削除したスキンは復活してしまうので、沼ランチャーから消してください
            </div>
          </div>
        </Fade>
      ) : undefined}
    </TransitionGroup>
  );
}

const styles = {
  root: css`
    background-color: rgba(50, 50, 50, 1);
    height: 100%;
    position: relative;
    width: 100vw;
    padding: 20px;
  `,
  closeButton: css`
    position: absolute;
    top: 15px;
    right: 40px;
  `,
  formControl: css`
    display: flex;
    align-items: center;
    label:first-of-type {
      margin-right: 10px;
    }
  `,
  centering: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  margin: css`
    margin: 12px 0;
  `,
  info: css`
    border: 1px solid white;
    padding: 10px 0;
    width: 80%;
    text-align: center;
  `,
  button: css`
    background-color: #008542;
    padding: 20px 100px;
    transition: 0.3s;
    :hover {
      opacity: 0.6;
    }
  `,
};
