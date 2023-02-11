import { css } from "@emotion/react";
import { ReactNode } from "react";
import { TransitionGroup } from "react-transition-group";
import Fade from "../components/Fade";
import Portal from "./Portal";

type Props = { in: boolean; children: ReactNode };
export default function Overlay({ in: inProps, children }: Props) {
  return (
    <TransitionGroup component={Portal}>
      {inProps ? (
        <Fade css={styles.root} timeout={500}>
          {children}
        </Fade>
      ) : undefined}
    </TransitionGroup>
  );
}
const styles = {
  root: css`
    position: absolute;
    height: calc(100vh - 24px);
    width: 100vw;
    top: 24px;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
  `,
};
