import { Main } from "./pages/Main";
import { css, Global } from "@emotion/react";
import AvenirBook from "../assets/fonts/Avenir-Book.ttf";
import AvenirMedium from "../assets/fonts/Avenir-Medium.ttf";
import Ringbearer from "../assets/fonts/Ringbearer.ttf";
import { MainPreloadProvider } from "./utils/preload";
export const App = () => {
  return (
    <>
      <Global
        styles={css`
          body {
            color: white;
            margin: 0;
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
      <MainPreloadProvider value={window.main}>
        <Main />
      </MainPreloadProvider>
    </>
  );
};
