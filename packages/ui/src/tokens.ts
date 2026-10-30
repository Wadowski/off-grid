// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const colorThemes = {
  light: {
    bg: "#f6f7f9",
    surface: "#ffffff",
    "surface-2": "#eef0f4",
    line: "#dfe3ea",
    fg: "#18181b",
    muted: "#5b6170",
    accent: "#0066ff",
    "accent-fg": "#ffffff",
    "accent-soft": "#e3eeff",
    "dark-chip": "#18181b",
    "dark-chip-fg": "#f4f4f5",
    good: "#067a52",
    warn: "#9a5b00",
    danger: "#b3261e",
  },
  dark: {
    bg: "#111215",
    surface: "#1a1c21",
    "surface-2": "#23262d",
    line: "#2e323b",
    fg: "#ececef",
    muted: "#9aa1b0",
    accent: "#4d8dff",
    "accent-fg": "#0b1220",
    "accent-soft": "#16233d",
    "dark-chip": "#f4f4f5",
    "dark-chip-fg": "#18181b",
    good: "#4edea3",
    warn: "#ffb95f",
    danger: "#f2b8b5",
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
  `.og-focusable:focus-visible { outline: var(--og-focus-ring-width) solid var(--og-color-accent); outline-offset: var(--og-focus-ring-offset); }`,
].join("\n");

export function cssVar(name: string): string {
  return `var(--og-${name})`;
}
