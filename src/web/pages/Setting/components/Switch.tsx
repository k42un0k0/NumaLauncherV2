import { css } from "@emotion/react";
import { useState } from "react";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};
export default function Switch({ value, onChange }: Props) {
  return (
    <div css={[styles.background, value && styles.backgroundActive]} onClick={() => onChange(!value)}>
      <div css={[styles.switch, value && styles.switchActive]}>
        <input type="checkbox" css={styles.input} checked={value} />
      </div>
    </div>
  );
}

const styles = {
  background: css`
    position: relative;
    width: 40px;
    height: 20px;
    border-radius: 1000px;
    display: flex;
    align-items: center;
    transition: 0.2s linear;
    background-color: rgba(255, 255, 255, 0.35);
    border: 1px solid rgba(126, 126, 126, 0.57);
  `,
  backgroundActive: css`
    background-color: rgb(31, 140, 11);
    border: 1px solid rgb(31, 140, 11);
  `,
  switch: css`
    height: 13px;
    width: 16px;
    background-color: white;
    box-shadow: 0px 1px 2px 0px rgb(0 0 0 / 75%);
    position: absolute;
    left: 3px;
    border-radius: 1000px;
    transition: 0.2s linear;
  `,
  switchActive: css`
    transform: translateX(15px);
  `,
  input: css`
    width: 100%;
    height: 100%;
    clip: rect(0, 0, 0, 0);
    position: absolute;
  `,
};
