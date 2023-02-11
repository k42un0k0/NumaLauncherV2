import { css } from "@emotion/react";
import { ReactNode } from "react";
import Menu from "./Menu";

type Props = {
  children: ReactNode;
};
export default function Container({ children }: Props) {
  return (
    <div css={styles.root}>
      <Menu />
      <div css={styles.pageContainer}>{children}</div>
    </div>
  );
}
const styles = {
  root: css`
    height: calc(100vh - 24px);
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
  `,
  pageContainer: css`
    height: 100%;
    overflow: auto;
    flex: 1;
    ::-webkit-scrollbar {
      width: 2px;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #ccc;
      min-height: 32px;
    }
  `,
};
