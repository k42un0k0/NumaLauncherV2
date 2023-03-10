import Frame from "@/web/pages/components/Frame";
import Container from "@/web/pages/Setting/components/Container";
import { css } from "@emotion/react";
import bg from "../assets/images/backgrounds/1.jpg";

export function withSettingContainer(Story: any) {
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
        <Container>
          <Story />
        </Container>
      </div>
    </div>
  );
}
