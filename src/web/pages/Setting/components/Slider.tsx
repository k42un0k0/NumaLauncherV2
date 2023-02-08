import { css } from "@emotion/react";
import { useReducer, useState } from "react";

type Props = {
  defaultValue: number;
  min: number;
  max: number;
};
export default function Slider({ defaultValue, max, min }: Props) {
  const [value] = useState(defaultValue);
  const range = max - min;
  return (
    <div>
      <div css={styles.button} style={{ width: (value / range) * 100 + "%" }} />
      <div
        css={styles.button}
        onDrag={(e) => {
          console.log();
        }}
      />
      <div css={styles.button} style={{ width: 100 - (value / range) * 100 + "%" }} />
    </div>
  );
}

const styles = {
  button: css`
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: red;
  `,
  left: css`
    height: 10px;
    position: absolute;
    left: 0;
    background-color: red;
  `,
  right: css`
    height: 10px;
    position: absolute;
    right: 0;
    background-color: red;
  `,
};
