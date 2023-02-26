import { css } from "@emotion/react";
import { useAtomValue } from "jotai";
import SealCircle from "../../../../assets/images/SealCircle.svg";
import { releaseNoteJotai, usePrepareReleaseNoteJotai } from "../../utils/releaseJotai";
export default function About() {
  usePrepareReleaseNoteJotai();
  const releaseNote = useAtomValue(releaseNoteJotai);

  return (
    <div>
      <div>
        <span>About</span>
        <span>現在のバージョンの更新履歴を見る</span>
      </div>
      <div css={styles.container}>
        <div>
          <div>
            <img css={styles.logo} src={SealCircle} />
            <span>沼ランチャー</span>
          </div>
          <div>
            <div>&#10003;</div>
            <div>
              <span>安定版リリース</span>
              <div>
                <span>Version </span>
                <span>0.0.1-alpha.12</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <a href="https://github.com/TeamKun/NumaLauncher" css={styles.link}>
            ソース (GitHub)
          </a>
          {/* <!-- The following must be included in third-party usage. --> */}
          <a href="https://github.com/dscalzi/HeliosLauncher" css={styles.link}>
            Original Source
          </a>
          <a href="https://github.com/TeamKun/NumaLauncher/issues" css={styles.link}>
            サポート
          </a>
          <a href="#">DevTools Console</a>
        </div>
      </div>
      <div css={styles.container}>
        <div>
          <div>
            <div>変更点</div>
            <div>アップデートの変更内容</div>
          </div>
          {releaseNote ? <></> : <div>更新履歴はありません</div>}
        </div>
        <div>
          <a href="https://github.com/TeamKun/NumaLauncher/releases/tag/v3.0.0" css={styles.link}>
            GitHubでアップデート内容を見る
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  logo: css`
    width: 30px;
    height: 30px;
    padding: 5px;
  `,
  link: css`
    background: none;
    border: none;
    font-size: 10px;
    color: grey;
    padding: 0px 5px;
    transition: 0.25s ease;
    outline: none;
    text-decoration: none;
    :hover,
    :focus {
      color: rgb(165, 165, 165);
    }
  `,

  container: css`
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(126, 126, 126, 0.57);
    border-radius: 3px;
    width: 75%;
    margin-bottom: 20px;
  `,
};
