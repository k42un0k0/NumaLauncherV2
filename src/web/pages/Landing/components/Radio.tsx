import { css } from "@emotion/react";
import { ComponentProps } from "react";

type Props = ComponentProps<"input">;
export default function Radio(props: Props) {
  return <input type="radio" css={styles.root} {...props} />;
}

const styles = {
  root: css`
    appearance: none;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    border: 2px solid #999;
    margin-right: 5px;
    margin: 0 5px 0 0;
    position: relative;
    top: 0;
    transition: 0.2s;
    cursor: pointer;
    :checked {
      border: 6px solid #008542;
      transition: 0.2s;
    }
  `,
};
