// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sharedDeclarations } from "./shared-declarations.js";
import { lightColors } from "./light-colors.js";
import { darkColors } from "./dark-colors.js";

export const tokensStylesheet = [
  `*, *::before, *::after { box-sizing: border-box; }`,
  `html, body { background: var(--og-color-bg); color: var(--og-color-fg); }`,
  `:root { ${sharedDeclarations} ${lightColors} }`,
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${darkColors} } }`,
  `:root[data-theme="dark"] { ${darkColors} }`,
  `.og-focusable:focus-visible { outline: var(--og-focus-ring-width) solid var(--og-color-accent); outline-offset: var(--og-focus-ring-offset); }`,
  `.og-input:focus { background: var(--og-color-surface); box-shadow: var(--og-elevation-focus); }`,
  `.og-input-shell:focus-within { background: var(--og-color-surface); box-shadow: var(--og-elevation-focus); }`,
].join("\n");
