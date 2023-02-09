import { css } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import ClickAwayListener from "../../components/ClickAwayListener";
import Fade from "../../components/Fade";
import Portal from "../../components/Portal";

export default function Tooltip() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: "0", left: "0" });
  const ref = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  function computeTooltipPosition() {
    if (!tooltipRef.current) return;
    const clientRect = ref.current!.getBoundingClientRect();
    const targetTop = clientRect.y;
    const targetLeft = clientRect.x;
    const toolTipHeight = tooltipRef.current.offsetHeight;
    const marginTop = 10;
    const top = targetTop + toolTipHeight + marginTop;
    const left = targetLeft;
    setPos({
      top: `${top}px`,
      left: `${left}px`,
    });
  }
  useEffect(() => {
    computeTooltipPosition();
  }, [open]);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div css={styles.root}>
        <TransitionGroup component={Portal}>
          {open ? (
            <Fade css={[styles.menu, css(pos)]} ref={tooltipRef} timeout={200}>
              へっぉ
            </Fade>
          ) : undefined}
        </TransitionGroup>
        <button ref={ref} onClick={() => setOpen(true)}>
          選択する
        </button>
      </div>
    </ClickAwayListener>
  );
}

const styles = {
  root: css`
    position: relative;
  `,
  menu: css`
    position: absolute;
    width: 100px;
    text-align: center;
    color: white;
    background-color: black;
    border-radius: 4px;
  `,
};
