import { mainPreload } from "@/web/utils/preload";
import { css } from "@emotion/react";
import Gear from "../../components/Icon/Gear";
import Tooltip from "../../components/Tooltip";
import { usePageMove } from "../../utils/pageJotai";
import { landingSelectors } from "../../utils/selectors";
import { useSelector } from "../../utils/stateJotai";
import Profile from "./Profile";

export default function Menu() {
  const pageMove = usePageMove();
  const account = useSelector(landingSelectors.account);
  return (
    <div css={styles.container}>
      <div css={styles.prifile}>
        <Profile account={account!} />
      </div>
      <div css={styles.tools}>
        <Tooltip tooltip={"設定"}>
          <button css={styles.tool} onClick={() => pageMove.setting()}>
            <Gear css={[styles.svg]} />
          </button>
        </Tooltip>
        <Tooltip tooltip={"保存場所"}>
          <button
            css={styles.tool}
            onClick={() => {
              mainPreload.openServerDir();
            }}
          >
            <svg css={[styles.svg]} viewBox="-2 0 25 21">
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
          </button>
        </Tooltip>
        <div css={styles.divider}></div>
        <Tooltip
          tooltip={
            <>
              KUN開発
              <br />
              チーム
            </>
          }
        >
          <button css={styles.tool}>
            <a href="https://www.kunmc.net/" target="_blank" rel="noreferrer">
              <svg css={[styles.svg]} viewBox="35.34 34.3575 70.68 68.71500">
                <g>
                  <path d="M75.37,65.51a3.85,3.85,0,0,0-1.73.42,8.22,8.22,0,0,1,.94,3.76A8.36,8.36,0,0,1,66.23,78H46.37a8.35,8.35,0,1,1,0-16.7h9.18a21.51,21.51,0,0,1,6.65-8.72H46.37a17.07,17.07,0,1,0,0,34.15H66.23A17,17,0,0,0,82.77,65.51Z" />
                  <path d="M66,73.88a3.85,3.85,0,0,0,1.73-.42,8.22,8.22,0,0,1-.94-3.76,8.36,8.36,0,0,1,8.35-8.35H95A8.35,8.35,0,1,1,95,78H85.8a21.51,21.51,0,0,1-6.65,8.72H95a17.07,17.07,0,0,0,0-34.15H75.13A17,17,0,0,0,58.59,73.88Z" />
                </g>
              </svg>
            </a>
          </button>
        </Tooltip>
        <Tooltip
          tooltip={
            <>
              使い方は
              <br />
              こちら！
            </>
          }
        >
          <button css={styles.tool}>
            <a href="https://www.notion.so/teamkun/6c1c4e39240b445a9e7d7907035df9b9">
              <svg css={[styles.svg]} style={{ fillRule: "evenodd" }} viewBox="0 0 64 64">
                <path d="M32,0.999C49.11,0.999 63.001,14.89 63.001,32C63.001,49.11 49.11,63.001 32,63.001C14.89,63.001 0.999,49.11 0.999,32C0.999,14.89 14.89,0.999 32,0.999ZM31.406,45.927C32.63,45.927 33.72,46.377 34.675,47.278C35.647,48.196 36.134,49.331 36.134,50.682C36.134,51.474 35.944,52.222 35.566,52.924C34.648,54.599 33.243,55.437 31.352,55.437C30.217,55.437 29.208,55.068 28.326,54.329C27.191,53.375 26.624,52.15 26.624,50.655C26.624,49.088 27.263,47.827 28.542,46.873C29.388,46.242 30.343,45.927 31.406,45.927ZM34.188,38.579L34.188,38.903C34.188,40.704 33.261,41.604 31.406,41.604C29.569,41.604 28.65,40.533 28.65,38.389C28.65,34.967 29.46,32.005 31.081,29.501C31.64,28.654 32.513,27.574 33.702,26.259C35.863,23.882 36.944,21.666 36.944,19.613C36.944,18.478 36.674,17.497 36.134,16.668C35.197,15.209 33.711,14.48 31.676,14.48C30.163,14.48 28.911,14.948 27.921,15.885C27.308,16.461 26.669,17.362 26.002,18.586C25.426,19.595 24.588,20.099 23.49,20.099C22.733,20.099 22.04,19.829 21.41,19.289C20.815,18.784 20.518,18.118 20.518,17.29C20.518,15.813 21.247,14.246 22.706,12.589C25.084,9.905 28.137,8.563 31.865,8.563C34.783,8.563 37.313,9.392 39.457,11.049C42.14,13.102 43.482,15.921 43.482,19.505C43.482,21.756 42.753,23.918 41.294,25.989C40.483,27.124 39.348,28.384 37.89,29.771C35.422,32.095 34.188,35.03 34.188,38.579Z" />
              </svg>
            </a>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  prifile: css`
    margin-bottom: 20px;
  `,
  tools: css`
    display: flex;
    flex-direction: column;
  `,
  tool: css`
    margin: 5px 0;
    transform-origin: center center;
    transition: 0.25s ease;
    :hover {
      transform: scale(1.5);
    }
  `,
  svg: css`
    fill: #ffffff;
    transition: 0.25s ease;
    cursor: pointer;
    height: 15px;
    width: 25px;
  `,
  divider: css`
    height: 1px;
    width: 14px;
    background: rgb(255, 255, 255);
    margin: 10px 5px;
  `,
};
