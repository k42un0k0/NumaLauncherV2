import { css } from "@emotion/react";
import { ComponentProps } from "react";

type Props = ComponentProps<"input">;
export default function Input(props: Props) {
  return <input type="text" css={styles.root} {...props} />;
}

const styles = {
  root: css`
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.8);
    background: rgba(0, 0, 0, 0.8);
    padding: 5px 10px;
    color: #ffffff;
  `,
};
