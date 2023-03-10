import { css } from "@emotion/react";
import { AuthAccount } from "../../../../../main/entities/config/msAccount";
import { usePageMove } from "../../../utils/pageJotai";

type Props = {
  account: AuthAccount;
};
export default function Profile({ account }: Props) {
  const pageMove = usePageMove();
  return (
    <div css={styles.root}>
      <div css={styles.name}>{account.displayName}</div>
      <div css={styles.avatar.root}>
        <img css={styles.avatar.image} src={`https://crafatar.com/renders/body/${account.uuid}?overlay`} />
        <button
          css={styles.avatar.button}
          onClick={() => {
            pageMove.setting();
          }}
        >
          <span>編集</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: css`
    position: relative;
    display: flex;
    align-items: center;
  `,
  name: css`
    position: absolute;
    left: -120%;
    font-size: 12px;
    letter-spacing: 1px;
    margin-right: 30px;
  `,
  avatar: {
    root: css`
      position: relative;
      border-radius: 50%;
      border: 2px solid #cad7e1;
      background: rgba(1, 2, 1, 0.5);
      height: 70px;
      width: 70px;
      overflow: hidden;
      position: relative;
    `,
    image: css`
      position: absolute;
      height: 70px;
      margin: auto;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    `,
    button: css`
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.35);
      opacity: 0;
      transition: 0.25s ease;
      :hover {
        opacity: 1;
      }
    `,
  },
};
