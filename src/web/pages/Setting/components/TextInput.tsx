import { css } from "@emotion/react";
import { ComponentProps } from "react";

type Props = ComponentProps<"input">;
export default function TextInput(props: Props) {
  return <input css={styles.root} {...props} />;
}

const styles = {
  root: css`
    color: white;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    border: 1px solid rgba(126, 126, 126, 0.57);
    font-family: "Avenir Book";
    transition: 0.25s ease;
  `,
};
