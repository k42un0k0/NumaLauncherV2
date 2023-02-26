import { css } from "@emotion/react";

type Props = { head: string; description: string };
export default function Head({ head, description }: Props) {
  return (
    <div>
      <div css={styles.head}>{head}</div>
      <div css={styles.description}>{description}</div>
    </div>
  );
}

const styles = {
  head: css`
    font-size: 20px;
    font-family: "Avenir Medium";
  `,
  description: css`
    font-size: 12px;
  `,
};
