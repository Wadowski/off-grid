// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const colorThemes = {
  light: {
    background: "#ffffff",
    surface: "#f4f6f5",
    text: "#1c2421",
    textMuted: "#4a5550",
    primary: "#2d6a4f",
    onPrimary: "#ffffff",
    border: "#7a857f",
    danger: "#b3261e",
    focus: "#1d4ed8",
  },
  dark: {
    background: "#121816",
    surface: "#1b2421",
    text: "#e8eeeb",
    textMuted: "#b4c0ba",
    primary: "#7fc8a0",
    onPrimary: "#0f1714",
    border: "#6f7b75",
    danger: "#f2b8b5",
    focus: "#93c5fd",
  },
} as const;

export const tokens = {
  color: colorThemes,
  space: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.5rem",
    6: "2rem",
  },
  font: {
    family: { base: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
    size: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
    weight: { regular: "400", semibold: "600" },
  },
  radius: { sm: "0.25rem", md: "0.5rem" },
  elevation: { 1: "0 1px 2px rgb(0 0 0 / 0.08)" },
  focusRing: { width: "3px", offset: "2px" },
} as const;

function kebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function declarations(prefix: string, values: Readonly<Record<string, string>>): string {
  return Object.entries(values)
    .map(([name, value]) => `--og-${prefix}-${kebabCase(name)}: ${value};`)
    .join(" ");
}

const sharedDeclarations = [
  declarations("space", tokens.space),
  declarations("font-family", tokens.font.family),
  declarations("font-size", tokens.font.size),
  declarations("font-weight", tokens.font.weight),
  declarations("radius", tokens.radius),
  declarations("elevation", tokens.elevation),
  declarations("focus-ring", tokens.focusRing),
].join(" ");

const lightColors = declarations("color", colorThemes.light);
const darkColors = declarations("color", colorThemes.dark);

export const tokensStylesheet = [
  `:root { ${sharedDeclarations} ${lightColors} }`,
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${darkColors} } }`,
  `:root[data-theme="dark"] { ${darkColors} }`,
  `.og-focusable:focus-visible { outline: var(--og-focus-ring-width) solid var(--og-color-focus); outline-offset: var(--og-focus-ring-offset); }`,
].join("\n");

export function cssVar(name: string): string {
  return `var(--og-${name})`;
}
