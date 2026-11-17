// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FILE_KIND_GLYPHS } from "./constants.js";
import { FileTypeIcon } from "./file-type-icon.js";
import type { FileKind } from "../files/types.js";

const kinds = Object.keys(FILE_KIND_GLYPHS) as FileKind[];

describe("FileTypeIcon", () => {
  it.each(kinds)("shows the %s kind with its own glyph and colour tokens", (kind) => {
    const { container } = renderWithI18n(<FileTypeIcon kind={kind} />);

    expect(screen.getByTestId("file-type-icon")).toHaveAttribute("data-kind", kind);
    const glyph = container.querySelector("[data-icon]") as HTMLElement;
    expect(glyph).toHaveAttribute("data-icon", FILE_KIND_GLYPHS[kind]);
    expect(glyph.style.color).toBe(`var(--og-color-file-${kind})`);
    const tile = glyph.parentElement as HTMLElement;
    expect(tile.style.background).toBe(`var(--og-color-file-${kind}-soft)`);
  });

  it("uses a different glyph for every kind", () => {
    expect(new Set(Object.values(FILE_KIND_GLYPHS)).size).toBe(kinds.length);
  });

  it("is decoration without a name by default", () => {
    const { container } = renderWithI18n(<FileTypeIcon kind="pdf" />);

    expect(container).not.toHaveTextContent("PDF");
  });

  it("exposes the name of the kind when it is labelled", () => {
    renderWithI18n(<FileTypeIcon kind="spreadsheet" labelled />);

    expect(screen.getByText("Spreadsheet")).toBeInTheDocument();
  });

  it.each([
    ["sm", "1.5rem"],
    ["md", "2.5rem"],
    ["lg", "3.5rem"],
  ] as const)("sizes the %s icon tile as %s", (size, tileSize) => {
    const { container } = renderWithI18n(<FileTypeIcon kind="image" size={size} />);

    const glyph = container.querySelector("[data-icon]") as HTMLElement;
    expect((glyph.parentElement as HTMLElement).style.width).toBe(tileSize);
  });
});
