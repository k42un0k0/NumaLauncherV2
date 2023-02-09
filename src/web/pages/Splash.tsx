import { css, keyframes } from "@emotion/react";
import text from "@/assets/images/LoadingText.svg";
import seal from "@/assets/images/LoadingSeal.svg";
import back from "@/assets/images/LoadingBack.svg";

export default function Splash() {
  return (
    <div css={styles.root}>
      <div css={styles.container}>
        <img src={back} css={[styles.back, styles.center]} />
        <img src={seal} css={[styles.seal, styles.center]} />
        <img src={text} css={[styles.text, styles.center]} />
      </div>
    </div>
  );
}

const animations = {
  rotate: keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
  `,
  rotateBack: keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
        transform: rotate(-360deg);
    }
  `,
};

const styles = {
  root: css`
    background-color: black;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  `,
  container: css`
    position: absolute;
    top: 24px;
    bottom: 0;
    left: 0;
    right: 0;
  `,
  center: css`
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  `,
  text: css`
    position: absolute;
    width: 277px;
    height: auto;
    z-index: 402;
  `,

  seal: css`
    position: absolute;
    width: 280px;
    height: auto;
    z-index: 401;
    animation: ${animations.rotate} 32s linear infinite;
  `,
  back: css`
    position: absolute;
    width: 280px;
    height: auto;
    z-index: 400;
    animation: ${animations.rotateBack} 25s linear infinite;
  `,
};
