import { createGlobalStyle } from "styled-components";
import { styleReset } from "react95";
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";

export const GlobalStyle = createGlobalStyle`
  ${styleReset}

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
  }

  body {
    font-family: 'ms_sans_serif', sans-serif;
    /* Classic Win9x teal desktop */
    background: #008080;
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
  }

  @keyframes crtFlicker {
    0%, 100% { opacity: 0.92; }
    50% { opacity: 1; }
    52% { opacity: 0.88; }
    54% { opacity: 1; }
  }
`;
