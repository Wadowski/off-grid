// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { cssVar, tokens, tokensStylesheet } from "./tokens.js";

function relativeLuminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (first, second) => second - first,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

const textPairs: Array<
  [foreground: keyof typeof tokens.color.light, background: keyof typeof tokens.color.light]
> = [
  ["text", "background"],
  ["text", "surface"],
  ["textMuted", "background"],
  ["textMuted", "surface"],
  ["onPrimary", "primary"],
  ["danger", "background"],
];

const nonTextPairs: Array<
  [foreground: keyof typeof tokens.color.light, background: keyof typeof tokens.color.light]
> = [
  ["border", "background"],
  ["focus", "background"],
  ["primary", "background"],
];

describe("tokens", () => {
  for (const themeName of ["light", "dark"] as const) {
    const theme = tokens.color[themeName];

    it(`meets WCAG 2.2 AA text contrast in the ${themeName} theme`, () => {
      for (const [foreground, background] of textPairs) {
        expect(contrastRatio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`meets WCAG 2.2 AA non-text contrast in the ${themeName} theme`, () => {
      for (const [foreground, background] of nonTextPairs) {
        expect(contrastRatio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(3);
      }
    });
  }

  it("declares every colour in the light and dark themes as a CSS variable", () => {
    for (const [name, value] of Object.entries(tokens.color.light)) {
      expect(tokensStylesheet).toContain(
        `--og-color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`,
      );
    }
    for (const value of Object.values(tokens.color.dark)) {
      expect(tokensStylesheet).toContain(value);
    }
  });

  it("switches colours for dark mode by preference and by explicit data-theme", () => {
    expect(tokensStylesheet).toContain(
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"])',
    );
    expect(tokensStylesheet).toContain(':root[data-theme="dark"] {');
  });

  it("exposes spacing, typography, radius and elevation as CSS variables", () => {
    expect(tokensStylesheet).toContain("--og-space-4: 1rem;");
    expect(tokensStylesheet).toContain("--og-font-size-md: 1rem;");
    expect(tokensStylesheet).toContain("--og-radius-md: 0.5rem;");
    expect(tokensStylesheet).toContain("--og-elevation-1:");
  });

  it("gives every focusable element a visible focus ring", () => {
    expect(tokensStylesheet).toContain(".og-focusable:focus-visible");
    expect(tokensStylesheet).toContain(
      `outline: ${cssVar("focus-ring-width")} solid ${cssVar("color-focus")};`,
    );
  });
});
