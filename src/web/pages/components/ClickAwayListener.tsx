import { cloneElement, ReactElement, useEffect, useRef } from "react";

type Props = { children: ReactElement; onClickAway: (e: MouseEvent) => void };

export default function ClickAwayListenr({ children, onClickAway }: Props) {
  const syntheticEventRef = useRef(false);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (syntheticEventRef.current) {
        syntheticEventRef.current = false;
        return;
      }
      onClickAway(e);
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
    };
  }, []);
  const handleClick = (event: React.SyntheticEvent) => {
    syntheticEventRef.current = true;

    const childrenPropsHandler = children.props["onClick"];
    if (childrenPropsHandler) {
      childrenPropsHandler(event);
    }
  };
  return cloneElement(children, { onClick: handleClick });
}
