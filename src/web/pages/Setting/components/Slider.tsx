import { css } from "@emotion/react";
import { useRef, useState } from "react";

type Props = {
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
};
export default function Slider({ defaultValue, max, min, step = 1 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const range = max - min;
  const onMouseDown = () => {
    const mousemove = (e: MouseEvent) => {
      const leftDiff = e.pageX - rootRef.current!.offsetLeft;
      const rightDiff = e.pageX - rootRef.current!.offsetLeft - rootRef.current!.offsetWidth;
      const diff =
        ((e.pageX - rootRef.current!.offsetLeft - thumbRef.current!.offsetLeft - 10) / rootRef.current!.offsetWidth) *
        100;
      if (rightDiff > 0) {
        setValue(max);
      }
      if (leftDiff < 0) {
        setValue(min);
      } else if (Math.abs(diff) > ((step / range) * 100) / 2) {
        if (diff < 0) {
          setValue((state) => {
            if (min > state - step) {
              return min;
            }
            return state - step;
          });
        } else {
          setValue((state) => {
            if (max < state + step) {
              return max;
            }
            return state + step;
          });
        }
      }
    };
    const mouseup = () => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  return (
    <div css={styles.root} ref={rootRef}>
      <div css={styles.track} />
      <div css={styles.rail} style={{ width: (value / range) * 100 + "%" }} />
      <div
        ref={thumbRef}
        style={{ left: "calc(" + (value / range) * 100 + "% - 10px)" }}
        css={styles.thumb}
        onMouseDown={onMouseDown}
      >
        <input type="range" value={value} css={styles.input} />
      </div>
    </div>
  );
}

const styles = {
  root: css`
    position: relative;
    margin: 10px;
    height: 30px;
    display: flex;
    align-items: center;
  `,
  thumb: css`
    position: absolute;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: blue;
    cursor: ew-resize;
  `,
  rail: css`
    height: 10px;
    position: absolute;
    left: 0;
    background-color: green;
  `,
  track: css`
    height: 10px;
    position: absolute;
    right: 0;
    left: 0;
    background-color: red;
  `,
  input: css`
    width: 100%;
    height: 100%;
    clip: rect(0, 0, 0, 0);
    position: absolute;
  `,
};
