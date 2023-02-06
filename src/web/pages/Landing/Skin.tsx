import { css } from "@emotion/react";

type Props = { in: boolean };
export default function Skin({ in: inProp }: Props) {
  return (
    <div css={[styles.container, inProp && styles.containerActive]}>
      <div>1</div>
      <div>2</div>
    </div>
  );
}

const styles = {
  container: css`
    height: 100%;
    display: flex;
    transition: 2s ease;
    transform: translateY(0);
    padding: 200px;
  `,
  containerActive: css`
    transform: translateY(-100%);
  `,
};
