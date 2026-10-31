// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokensStylesheet } from "@offgrid/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { App } from "./app.js";
import "./i18n/i18n.js";
import { ErrorFallback } from "./shell/error-fallback.js";

const tokenStyle = document.createElement("style");
tokenStyle.textContent = tokensStylesheet;
document.head.append(tokenStyle);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
