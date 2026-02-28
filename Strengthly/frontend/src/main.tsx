import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/globals.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Remove preload overlay only after initial app paint.
const loadingEl = document.getElementById("app-loading");
if (loadingEl) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadingEl.remove();
    });
  });
}
