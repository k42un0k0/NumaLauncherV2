import { Main } from "./pages/Main";
import { css, Global } from "@emotion/react";
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
          button {
            border: none;
            background-color: transparent;
            padding: 0;
            cursor: pointer;
            color: currentColor;
          }
        `}
      />
      <Main />
    </>
  );
};
