import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles.css";

import ErrorBoundary
from "./components/ui/ErrorBoundary";

import ToastHost
from "./components/ui/ToastHost";

import {
  AuthProvider
}
from "./context/AuthContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <ErrorBoundary>

      <AuthProvider>
        <App />
      </AuthProvider>

      <ToastHost />

    </ErrorBoundary>

  </React.StrictMode>
);
