// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { sharedDeclarations } from "./shared-declarations.js";
import { lightColors } from "./light-colors.js";
import { darkColors } from "./dark-colors.js";

export const tokensStylesheet = [
  `:root { ${sharedDeclarations} ${lightColors} }`,
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${darkColors} } }`,
  `:root[data-theme="dark"] { ${darkColors} }`,
  `.og-focusable:focus-visible { outline: var(--og-focus-ring-width) solid var(--og-color-accent); outline-offset: var(--og-focus-ring-offset); }`,
].join("\n");
