import { ComponentProps, ReactNode, useRef } from "react";
import { Transition } from "react-transition-group";

type Props = {
  children: ReactNode;
} & Omit<ComponentProps<typeof Transition>, "children">;
export default function Fade({ children, ...props }: Props) {
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
    <Transition nodeRef={ref} timeout={1000} mountOnEnter {...props}>
      {(state) => {
        return (
          <div
            ref={ref}
            className={props.className}
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
