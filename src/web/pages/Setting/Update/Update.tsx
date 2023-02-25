import pack from "../../../../../package.json";
export default function Account() {
  return (
    <div>
      <div>
        <span>ランチャーの更新</span>
        <span>ランチャーのアップデートを行います。</span>
      </div>
      <div>
        <div>
          <div>
            <span>現在のランチャーは最新版です</span>
            <span>{pack.version}</span>
          </div>
          <div>
            <div>&#10003;</div>
            <div>
              <span>安定版リリース</span>
              <div>
                <span>Version </span>
                <span>0.0.1-alpha.18</span>
              </div>
            </div>
          </div>
          <div>
            <button>アップデートをチェックする</button>
          </div>
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
      </div>
    </div>
  );
}
