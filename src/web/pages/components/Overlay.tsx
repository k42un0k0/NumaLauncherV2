import { css } from "@emotion/react";
import { ReactNode } from "react";
import { TransitionGroup } from "react-transition-group";
import Fade from "../components/Fade";

type Props = { in: boolean; children: ReactNode };
export default function Overlay({ in: inProps, children }: Props) {
  return (
    <TransitionGroup>
      {inProps && (
        <Fade css={styles.root} timeout={500}>
          {children}
        </Fade>
      )}
    </TransitionGroup>
  );
}
const styles = {
  root: css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  `,
};
