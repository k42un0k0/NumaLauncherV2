import { css } from "@emotion/react";
import { useState } from "react";

type Props = {
  defaultValue: number;
  min: number;
  max: number;
};
export default function Slider({ defaultValue, max, min }: Props) {
  const [value] = useState(defaultValue);
  const range = max - min;
  return (
    <div css={styles.root}>
      <div css={styles.left} style={{ width: (value / range) * 100 + "%" }} />
      <div
        style={{ left: "calc(" + (value / range) * 100 + "% - 10px)" }}
        css={styles.button}
        onDrag={(e) => {
          console.log();
        }}
      />
      <div css={styles.right} style={{ width: 100 - (value / range) * 100 + "%" }} />
    </div>
  );
}

const styles = {
  root: css`
    height: 30px;
    display: flex;
    align-items: center;
  `,
  button: css`
    position: absolute;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: red;
  `,
  left: css`
    height: 10px;
    position: absolute;
    left: 0;
    background-color: green;
  `,
  right: css`
    height: 10px;
    position: absolute;
    right: 0;
    background-color: red;
  `,
};
