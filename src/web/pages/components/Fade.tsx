import { forwardRef, ReactNode, useRef } from "react";
import { Transition } from "react-transition-group";
import { TransitionProps } from "react-transition-group/Transition";
import useForkRef from "../utils/useForkRef";

// `TransitionProps` has `[prop: string]: any` property. so `OmitedTransitionProps` is `any`;
type OmitedTransitionProps = Omit<TransitionProps<HTMLDivElement>, "addEndListener" | "children">;

type Props = {
  children: ReactNode;
} & OmitedTransitionProps;
forwardRef;
export default forwardRef<HTMLDivElement, Props>(function Fade({ children, className, timeout = 1000, ...props }, ref) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const forkedRef = useForkRef(nodeRef, ref);
  const transitionProperties = {
    entered: { opacity: 1 },
    entering: { opacity: 1 },
    exited: { opaicty: 0 },
    exiting: { opacity: 0 },
    unmounted: {},
  };
  return (
    <Transition nodeRef={nodeRef} timeout={timeout} mountOnEnter {...props}>
      {(state) => {
        return (
          <div
            ref={forkedRef}
            className={className}
            style={{
              transition: `${timeout}ms opacity`,
              opacity: 0,
              ...transitionProperties[state],
            }}
          >
            {children}
          </div>
        );
      }}
    </Transition>
  );
});
