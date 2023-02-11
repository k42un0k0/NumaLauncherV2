import { css, Global } from "@emotion/react";
import AvenirBook from "../src/assets/fonts/Avenir-Book.ttf";
import AvenirMedium from "../src/assets/fonts/Avenir-Medium.ttf";
import Ringbearer from "../src/assets/fonts/ringbearer.ttf";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: { default: "dark" },
};

export const decorators = [
  (Story) => (
    <>
      <Global
        styles={css`
          body {
            color: white;
            margin: 0;
            padding: 0 !important;
          }
          * {
            box-sizing: border-box;
          }
          @font-face {
            font-family: "Avenir Book";
            src: url("${AvenirBook}");
          }

          @font-face {
            font-family: "Avenir Medium";
            src: url("${AvenirMedium}");
          }

          @font-face {
            font-family: "Ringbearer";
            src: url("${Ringbearer}");
          }
          button {
            border: none;
            background-color: transparent;
            padding: 0;
            cursor: pointer;
            color: currentColor;
            font-family: "Avenir Book";
          }
        `}
      />
      <Story />
    </>
  ),
];
