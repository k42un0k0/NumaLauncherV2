import { css } from "@emotion/react";

type Props = {
  open: boolean;
  onClickClose: () => void;
};
export default function EditSkin({ open, onClickClose }: Props) {
  return (
    <>
      {open && (
        <div css={styles.root}>
          <button css={styles.closeButton} onClick={onClickClose}>
            <span css={styles.close}></span>
          </button>
          <div>
            <div>
              <div>
                <div>スキンの変更</div>
                <p>公式ランチャーからスキン情報をインポート！</p>
                <input type="button" name="ImportSkinJSON" value="公式ランチャーからスキン情報をコピーする" />
              </div>
            </div>
            <p>スキンライブラリを公式と沼ランチャーで同期しますか？</p>
            <div>
              <div>
                <input type="radio" name="syncSkin" value="true" />
                <label htmlFor="syncSkinTrue">常に同期する</label>
                <input type="radio" name="syncSkin" value="false" />
                <label htmlFor="syncSkinFalse">同期しない</label>
              </div>
              <div>
                <input type="button" name="saveSettingSkin" value="スキンの同期・非同期設定を保存する" />
              </div>
            </div>
            <div>
              <strong>スキンの削除について</strong>
              <br />
              ・公式ランチャーで削除したスキンは復活してしまうので、沼ランチャーから消してください
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  root: css`
    background-color: rgba(50, 50, 50, 1);
    height: 100%;
    position: relative;
    width: 100vw;
  `,
  closeButton: css`
    position: absolute;
    top: 30px;
    right: 40px;
    width: 30px;
    height: 30px;
  `,

  close: css`
    :before {
      position: absolute;
      content: "";
      width: 20px;
      height: 2px;
      left: 6px;
      top: 15px;
      border-radius: 2px;
      background: #ffffff;
      transform: rotate(45deg);
    }
    :after {
      position: absolute;
      content: "";
      width: 20px;
      height: 2px;
      top: 15px;
      left: 6px;
      border-radius: 2px;
      background: #ffffff;
      transform: rotate(-45deg);
    }
  `,
};
