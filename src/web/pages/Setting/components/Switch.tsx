import { css } from "@emotion/react";
import { ChangeEvent, useState, useEffect } from "react";

type Props = {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (e: ChangeEvent) => void;
};
export default function Switch({ value, defaultValue, onChange }: Props) {
  const [checkedState, setCheckedState] = useState(defaultValue != null ? defaultValue : value);
  useEffect(() => {
    setCheckedState(value);
  }, [value]);
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setCheckedState(newChecked);
    if (onChange) {
      onChange(event);
    }
  };
  const checked = value != null ? value : checkedState;
  return (
    <div css={[styles.background, checked && styles.backgroundActive]}>
      <div css={[styles.switch, checked && styles.switchActive]}></div>
      <input type="checkbox" css={styles.input} checked={checked} onChange={handleInputChange} />
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
    cursor: inherit;
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    zindex: 1;
  `,
};
