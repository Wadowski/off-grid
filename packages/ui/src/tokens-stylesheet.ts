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
  `.og-text-field-shell { position: relative; }`,
  `.og-text-field-shell .og-input { width: 100%; min-width: 0; padding: var(--og-space-2) var(--og-space-8); border: none; border-radius: var(--og-radius-md); background: var(--og-color-surface-low); box-shadow: inset 0 0 0 1px var(--og-color-outline); color: var(--og-color-fg); outline: none; font-family: var(--og-font-family-base); font-size: var(--og-font-size-body-md); line-height: var(--og-line-height-body-md); letter-spacing: var(--og-letter-spacing-body-md); }`,
  `.og-text-field-shell .og-input:focus { background: var(--og-color-surface); box-shadow: var(--og-elevation-focus); }`,
  `.og-text-field-shell.og-text-field-has-leading .og-input { padding-left: var(--og-space-9); }`,
  `.og-text-field-shell.og-text-field-has-trailing .og-input { padding-right: var(--og-space-10); }`,
  `.og-text-field-shell .og-input.og-text-field-mono { font-family: var(--og-font-family-mono); letter-spacing: 0.025em; }`,
  `.og-text-field-leading, .og-text-field-trailing { position: absolute; top: 50%; transform: translateY(-50%); display: flex; align-items: center; }`,
  `.og-text-field-leading { left: var(--og-space-8); pointer-events: none; }`,
  `.og-text-field-trailing { right: var(--og-space-2); }`,
  `.og-text-field-invalid .og-input { box-shadow: 0 0 0 1px var(--og-color-danger); }`,
  `@media (max-width: 639px) {
  .og-text-field-shell { position: relative; display: flex; align-items: center; gap: var(--og-space-7); padding: var(--og-space-8) var(--og-space-3); border-radius: var(--og-radius-lg); background: var(--og-color-surface-2); box-shadow: var(--og-elevation-1), inset 0 0 0 1px var(--og-color-outline); }
  .og-text-field-shell:focus-within { background: var(--og-color-surface); box-shadow: var(--og-elevation-focus); }
  .og-text-field-invalid { box-shadow: var(--og-elevation-1), 0 0 0 1px var(--og-color-danger); }
  .og-text-field-shell .og-input { flex: 1; padding: 0; background: transparent; font-size: var(--og-font-size-body-lg); line-height: var(--og-line-height-body-lg); letter-spacing: var(--og-letter-spacing-body-lg); box-shadow: none; }
  .og-text-field-shell .og-input:focus { background: transparent; box-shadow: none; }
  .og-text-field-shell.og-text-field-has-leading .og-input, .og-text-field-shell.og-text-field-has-trailing .og-input { padding: 0; }
  .og-text-field-leading, .og-text-field-trailing { position: static; transform: none; }
  .og-text-field-invalid .og-input { box-shadow: none; }
}`,
].join("\n");
