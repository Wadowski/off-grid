// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokensStylesheet } from "@offgrid/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { App } from "./app.js";
import "./i18n/i18n.js";
import { ErrorFallback } from "./errors/error-fallback/error-fallback.js";

const tokenStyle = document.createElement("style");
tokenStyle.textContent = tokensStylesheet;
document.head.append(tokenStyle);

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("The #root element is missing from index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
