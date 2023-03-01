import { css } from "@emotion/react";
import { usePageMove } from "../utils/pageJotai";

export default function FirstLaunch() {
  const pageMove = usePageMove();
  return (
    <div css={styles.root}>
      <button onClick={() => pageMove.login()}>login</button>
    </div>
  );
}
const styles = {
  root: css`
    height: calc(100vh - 24px);
    position: relative;
    overflow: hidden;
  `,
};
