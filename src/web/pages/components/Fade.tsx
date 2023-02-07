import { ReactNode, useRef } from "react";
import { Transition } from "react-transition-group";
import { TransitionProps } from "react-transition-group/Transition";

// `TransitionProps` has `[prop: string]: any` property. so `OmitedTransitionProps` is `any`;
type OmitedTransitionProps = Omit<TransitionProps<HTMLDivElement>, "addEndListener" | "children">;

type Props = {
  children: ReactNode;
} & OmitedTransitionProps;

export default function Fade({ children, className, timeout = 1000, ...props }: Props) {
  console.log(props);
  const ref = useRef(null);
  const transitionProperties = {
    entered: { opacity: 1 },
    entering: { opacity: 1 },
    exited: { opaicty: 0 },
    exiting: { opacity: 0 },
    unmounted: {},
  };
  return (
    <Transition nodeRef={ref} timeout={timeout} mountOnEnter {...props}>
      {(state) => {
        return (
          <div
            ref={ref}
            className={className}
            style={{
              transition: "1000ms",
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
}
