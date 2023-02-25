export default function About() {
  return (
    <div>
      <div>
        <span>About</span>
        <span>現在のバージョンの更新履歴を見る</span>
      </div>
      <div>
        <div>
          <div>
            <img src="./assets/images/SealCircle.svg" />
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
          <a href="https://github.com/TeamKun/NumaLauncher">ソース (GitHub)</a>
          {/* <!-- The following must be included in third-party usage. --> */}
          <a href="https://github.com/dscalzi/HeliosLauncher">Original Source</a>
          <a href="https://github.com/TeamKun/NumaLauncher/issues">サポート</a>
          <a href="#">DevTools Console</a>
        </div>
      </div>
      <div>
        <div>
          <div>
            <div>変更点</div>
            <div>アップデートの変更内容</div>
          </div>
          <div>更新履歴はありません</div>
        </div>
        <div>
          <a href="#">GitHubでアップデート内容を見る</a>
        </div>
      </div>
    </div>
  );
}
