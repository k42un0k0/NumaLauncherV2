import { settingSelectors } from "../../utils/selectors";
import { useSelector } from "../../utils/stateJotai";
import Head from "../components/Head";
import Switch from "../components/Switch";

export default function Launcher() {
  const launcher = useSelector(settingSelectors.launcher);
  return (
    <div>
      <Head head="ランチャー設定" description="沼ランチャー本体の設定です" />
      <div>
        <div>
          <span>プレリリース版へ更新</span>
          <span>
            プレリリース版はほぼ作られることはありません
            <br />
            オフにしておくことを推奨します
          </span>
        </div>
        <Switch defaultValue={launcher.allowPrerelease} />
      </div>
      <div>
        <div>
          <div id="settingsDataDirTitle">データフォルダ</div>
          <div>
            <div>
              <svg>
                <g>
                  <path
                    fill="gray"
                    d="m10.044745,5c0,0.917174 -0.746246,1.667588 -1.667588,1.667588l-4.168971,0l-2.501382,0c-0.921009,0 -1.667588,0.750415 -1.667588,1.667588l0,6.670353l0,2.501382c0,0.917174 0.746604,1.667588 1.667588,1.667588l16.675882,0c0.921342,0 1.667588,-0.750415 1.667588,-1.667588l0,-2.501382l0,-8.337941c0,-0.917174 -0.746246,-1.667588 -1.667588,-1.667588l-8.337941,0z"
                  />
                  <path
                    fill="gray"
                    d="m1.627815,1.6c-0.921009,0 -1.667588,0.746579 -1.667588,1.667588l0,4.168971l8.337941,0l0,0.833794l11.673118,0l0,-4.168971c0,-0.921009 -0.746246,-1.667588 -1.667588,-1.667588l-8.572237,0c-0.288493,-0.497692 -0.816284,-0.833794 -1.433292,-0.833794l-6.670353,0z"
                  />
                  <path
                    fill="lightgray"
                    d="m10.025276,4c0,0.918984 -0.747719,1.670879 -1.670879,1.670879l-4.177198,0l-2.506319,0c-0.922827,0 -1.670879,0.751896 -1.670879,1.670879l0,6.683517l0,2.506319c0,0.918984 0.748078,1.670879 1.670879,1.670879l16.708794,0c0.923161,0 1.670879,-0.751896 1.670879,-1.670879l0,-2.506319l0,-8.354397c0,-0.918984 -0.747719,-1.670879 -1.670879,-1.670879l-8.354397,0z"
                  />
                </g>
              </svg>
            </div>
            <input type="text" defaultValue={launcher.dataDirectory} disabled />
            <button>保存場所を変更</button>
          </div>
        </div>
        <div>
          このランチャーのすべてのゲームデータが保存されます
          <br />
          スクリーンショットとワールドは、各Modパックのフォルダに保存されます
        </div>
      </div>
    </div>
  );
}
