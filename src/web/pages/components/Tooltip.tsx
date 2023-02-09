import { css } from "@emotion/react";
import { cloneElement, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import Fade from "./Fade";

type Props = { children: ReactElement; tooltip: ReactNode };

export default function Tooltip({ children, tooltip }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: "0", left: "0" });
  const [place, setPlace] = useState("left");
  const ref = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const onMouseOver = () => {
    setOpen(true);
  };
  const onMouseLeave = () => {
    setOpen(false);
  };
  function computeTooltipPosition() {
    if (!tooltipRef.current) return;
    const clientRect = ref.current!.getBoundingClientRect();
    const targetHeight = ref.current!.offsetHeight;
    const toolTipWidth = tooltipRef.current.offsetWidth;
    const toolTipHeight = tooltipRef.current.offsetHeight;
    const margin = 15;
    const top = targetHeight / 2 - toolTipHeight / 2;
    const leftForLeft = -toolTipWidth - margin;
    const leftForRight = toolTipWidth + margin;
    console.log(clientRect.x + leftForLeft);
    if (clientRect.x + leftForLeft > 0) {
      setPos({
        top: `${top}px`,
        left: `${leftForLeft}px`,
      });
      setPlace("left");
      return;
    }
    setPos({
      top: `${top}px`,
      left: `${leftForRight}px`,
    });
    setPlace("right");
  }
  useEffect(() => {
    computeTooltipPosition();
  }, [open]);
  return (
    <div css={styles.root}>
      <TransitionGroup>
        {open ? (
          <Fade
            css={[
              styles.tooltip,
              css(pos),
              place === "left" && styles.tooltipLeft,
              place === "right" && styles.tooltipRight,
            ]}
            ref={tooltipRef}
            timeout={200}
          >
            {tooltip}
          </Fade>
        ) : undefined}
      </TransitionGroup>

      {cloneElement(children, {
        ref,
        onMouseOver,
        onMouseLeave,
      })}
    </div>
  );
}

const styles = {
  root: css`
    position: relative;
  `,
  tooltipLeft: css`
    ::after {
      right: -5px;
    }
  `,
  tooltipRight: css`
    ::after {
      left: -5px;
    }
  `,
  tooltip: css`
    font-size: 12px;
    position: absolute;
    width: 100px;
    text-align: center;
    color: white;
    background-color: black;
    border-radius: 4px;
    ::after {
      display: block;
      content: "";
      position: absolute;
      height: 10px;
      width: 10px;
      top: calc(50% - 5px);
      background-color: black;
      transform: rotate(-45deg) matrix(1, 0.2, 0.2, 1, 0, 0);
    }
  `,
};
