import Frame from "@/web/pages/components/Frame";
import { css } from "@emotion/react";
import { ReactNode } from "react";
import bg from "../assets/images/backgrounds/1.jpg";

type Props = {
  children: ReactNode;
};
export default function MainWindow({ children }: Props) {
  return (
    <div
      css={css`
        height: 100vh;
        width: 100vw;
        background-image: url("${bg}");
        background-size: cover;
      `}
    >
      <Frame />
      <div
        css={css`
          position: relative;
          height: calc(100% - 24px);
          background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.65) 100%);
        `}
      >
        {children}
      </div>
    </div>
  );
}
