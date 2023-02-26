import { css } from "@emotion/react";
import { ReactNode, useRef } from "react";

type Props = { children: ReactNode; onChange: (files: FileList) => void };
export default function Dnd({ children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      css={styles.root}
      onDrop={(e) => {
        console.log(e.dataTransfer.files);
        e.preventDefault();
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onClick={() => inputRef.current!.click()}
    >
      <input type="file" multiple css={styles.input} ref={inputRef} onChange={(e) => console.log(e.target.files)} />
      {children}
    </div>
  );
}

const styles = {
  root: css`
    position: relative;
    background-color: green;
    cursor: pointer;
  `,
  input: css`
    width: 100%;
    height: 100%;
    clip: rect(0, 0, 0, 0);
    position: absolute;
  `,
};
