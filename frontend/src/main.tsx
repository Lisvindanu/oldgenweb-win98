import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import original from "react95/dist/themes/original";
import { GlobalStyle } from "./styles/GlobalStyle";
import { SocketProvider } from "./ws/SocketProvider";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyle />
    <ThemeProvider theme={original}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </StrictMode>,
);
