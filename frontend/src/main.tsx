import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import original from "react95/dist/themes/original";
import { GlobalStyle } from "./styles/GlobalStyle";
import { SocketProvider } from "./ws/SocketProvider";
import App from "./App";

// styled-components v6 forwards every prop to the DOM by default, so react95's
// custom props (active, square, fixed, primary, …) leak and trigger console
// warnings. Only forward valid HTML attributes to actual DOM elements.
const shouldForwardProp = (propName: string, target: unknown) =>
  typeof target === "string" ? isPropValid(propName) : true;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <GlobalStyle />
      <ThemeProvider theme={original}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ThemeProvider>
    </StyleSheetManager>
  </StrictMode>,
);
