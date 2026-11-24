// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FileTable } from "./file-table.js";

describe("FileTable", () => {
  it("is a labelled table with Name, Modified, Size, Type and a visually hidden Actions column header", () => {
    renderWithI18n(
      <FileTable isBusy={false}>
        <tr />
      </FileTable>,
    );

    const table = screen.getByRole("table", { name: "Folder contents" });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Name",
      "Modified",
      "Size",
      "Type",
      "Actions",
    ]);
    for (const header of headers) {
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("lists the rows it is given in order", () => {
    renderWithI18n(
      <FileTable isBusy={false}>
        <tr>
          <td>First</td>
        </tr>
        <tr>
          <td>Second</td>
        </tr>
      </FileTable>,
    );

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows.slice(1).map((row) => row.textContent)).toEqual(["First", "Second"]);
  });

  it("marks the table busy while more rows are loading", () => {
    renderWithI18n(
      <FileTable isBusy>
        <tr />
      </FileTable>,
    );

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
  });

  it("uses only design tokens for colour", () => {
    renderWithI18n(
      <FileTable isBusy={false}>
        <tr />
      </FileTable>,
    );

    const style = screen.getByRole("table").getAttribute("style") ?? "";
    expect(style).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(style).toContain("var(--og-color-fg)");
  });
});
