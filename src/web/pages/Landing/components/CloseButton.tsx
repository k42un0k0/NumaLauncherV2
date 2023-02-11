import { css } from "@emotion/react";

type Props = {
  onClick: () => void;
};
export default function CloseButton({ onClick }: Props) {
  return (
    <button css={styles.root} onClick={onClick}>
      <span css={styles.icon}></span>
    </button>
  );
}

const styles = {
  root: css`
    width: 30px;
    height: 30px;
  `,

  icon: css`
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
