import { SkinJSON } from "@/main/skin";
import { readFile } from "@/web/utils/file";
import { css } from "@emotion/react";
import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import { SkinViewer } from "skinview3d";
import Fade from "../components/Fade";
import Input from "../components/Input";
import Radio from "../components/Radio";
import CloseButton from "./components/CloseButton";
import { alexSkinImage, steveSkinImage } from "./utils/skinoriginimg";
import { createViewer } from "./utils/useSkinViewer";

type Props = {
  open: boolean;
  onClickClose: () => void;
  skinJson: SkinJSON;
};
export default function EditSkin({ open, onClickClose, skinJson }: Props) {
  const viewer = useRef<SkinViewer>();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    viewer.current = createViewer(ref.current);
  }, [open]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [skinModel, setSkinModel] = useState("default");
  const [name, setName] = useState("");

  // ラジオボタンの値がチェンジされた時
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSkinModel(e.target.value);
  };
  useEffect(() => {
    if (!files || !files[0]) {
      if (skinModel === "default") {
        viewer.current?.loadSkin(steveSkinImage, { model: "default" });
      } else {
        viewer.current?.loadSkin(alexSkinImage, { model: "slim" });
      }
      return;
    }
    readFile(files[0]).then((result) => {
      if (!result) return;
      viewer.current?.loadSkin(result.toString(), { model: skinModel as "default" });
    });
  }, [files, skinModel]);
  return (
    <TransitionGroup component={Fragment}>
      {open ? (
        <Fade css={styles.root}>
          <div css={styles.closeButton}>
            <CloseButton onClick={onClickClose} />
          </div>
          <div css={styles.heading}>スキンの新規追加</div>
          <div css={styles.container}>
            <div>
              <canvas ref={ref}></canvas>
            </div>
            <div css={styles.form}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div css={styles.formControll}>
                  <label>名前</label>
                  <div>
                    <Input onChange={(e) => setName(e.target.value)} type="text" placeholder="名前のないスキン" />
                  </div>
                </div>
                <div css={styles.formControll}>
                  <label>プレイヤーモデル</label>
                  <div>
                    <div>
                      <Radio
                        name="skinModel"
                        value="default"
                        checked={skinModel === "default"}
                        id="skinAddModelClassic"
                        required
                        onChange={handleChange}
                      />
                      <label htmlFor="skinAddModelClassic">クラシック</label>
                      <Radio
                        name="skinAddModel"
                        value="slim"
                        checked={skinModel === "slim"}
                        id="skinAddModelSlim"
                        onChange={handleChange}
                      />
                      <label htmlFor="skinAddModelSlim">スリム</label>
                    </div>
                  </div>
                </div>
                <div css={styles.formControll}>
                  <label>スキンファイル</label>
                  <div>
                    <input
                      type="file"
                      id="skinAddBox"
                      name="skinAddBoxName"
                      accept="image/png"
                      onChange={(e) => {
                        setFiles(e.target.files);
                      }}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div>
            <input type="button" value="キャンセル" onClick={onClickClose} />
            <input type="button" value="保存" />
            <input type="button" value="保存して使用" />
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
  `,
  closeButton: css`
    position: absolute;
    top: 15px;
    right: 40px;
  `,
  heading: css`
    text-align: center;
    padding: 20px 0 10px;
    font-weight: bold;
  `,
  container: css`
    display: flex;
    justify-content: center;
    margin: auto;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  `,
  form: css`
    width: 40%;
  `,
  formControll: css`
    margin: 20px;
    label {
      font-size: 12px;
    }
  `,
};
