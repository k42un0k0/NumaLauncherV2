import { css } from "@emotion/react";
import { useState } from "react";

type Props = {
  defaultValue: boolean;
};
export default function Switch({ defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div css={[styles.background, value && styles.backgroundActive]} onClick={() => setValue(!value)}>
      <div css={[styles.switch, value && styles.switchActive]}>
        <input type="checkbox" css={styles.input} checked={value} />
      </div>
    </div>
  );
}

const styles = {
  background: css`
    position: relative;
    width: 100px;
    height: 50px;
    border-radius: 1000px;
    background-color: grey;
    display: flex;
    align-items: center;
    transition: 0.2s linear;
  `,
  backgroundActive: css`
    background-color: green;
  `,
  switch: css`
    width: 50px;
    height: 35px;
    position: absolute;
    left: 10px;
    background-color: yellow;
    border-radius: 1000px;
    transition: 0.2s linear;
  `,
  switchActive: css`
    left: 40px;
  `,
  input: css`
    width: 100%;
    height: 100%;
    clip: rect(0, 0, 0, 0);
    position: absolute;
  `,
};
