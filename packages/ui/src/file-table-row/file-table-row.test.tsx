// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FileTableRow } from "./file-table-row.js";

const NOW = new Date("2026-11-17T12:00:00Z");
const YESTERDAY = new Date("2026-11-16T09:00:00Z");

const renderRow = (props: Parameters<typeof FileTableRow>[0]) =>
  renderWithI18n(
    <table>
      <tbody>
        <FileTableRow {...props} />
      </tbody>
    </table>,
  );

describe("FileTableRow", () => {
  it("shows the name, last change, size and type of a file", () => {
    renderRow({
      name: "Policy.pdf",
      kind: "pdf",
      sizeBytes: 2_800_000,
      modifiedAt: YESTERDAY,
      locale: "en",
      now: NOW,
      timeZone: "UTC",
    });

    expect(screen.getByTestId("file-table-name")).toHaveTextContent("Policy.pdf");
    expect(screen.getByTestId("file-modified")).toHaveTextContent("Yesterday");
    expect(screen.getByTestId("file-size")).toHaveTextContent("2.8 MB");
    expect(screen.getByRole("cell", { name: "PDF" })).toBeInTheDocument();
  });

  it("shows the number of items of a folder in the size column and the folder type", () => {
    renderRow({ name: "Photos", kind: "folder", itemCount: 184 });

    expect(screen.getByTestId("file-item-count")).toHaveTextContent("184 items");
    expect(screen.queryByTestId("file-size")).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Folder" })).toBeInTheDocument();
  });

  it("uses the singular for one item", () => {
    renderRow({ name: "Photos", kind: "folder", itemCount: 1 });

    expect(screen.getByTestId("file-item-count")).toHaveTextContent("1 item");
  });

  it("leaves out the size and the change when they are unknown", () => {
    renderRow({ name: "Draft", kind: "generic" });

    expect(screen.queryByTestId("file-size")).not.toBeInTheDocument();
    expect(screen.queryByTestId("file-modified")).not.toBeInTheDocument();
  });

  it("keeps a long name on one line and readable in full through its title", () => {
    const name = "a-very-long-file-name-".repeat(10);
    renderRow({ name, kind: "document" });

    const label = screen.getByTestId("file-table-name");
    expect(label).toHaveAttribute("title", name);
    expect(label.style.textOverflow).toBe("ellipsis");
    expect(label.style.whiteSpace).toBe("nowrap");
  });

  it("marks a selected row and its activator as the current item", () => {
    renderRow({ name: "Policy.pdf", kind: "pdf", selected: true, onActivate: vi.fn() });

    expect(screen.getByTestId("file-table-row")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("file-table-activate")).toHaveAttribute("aria-current", "true");
  });

  it("does not mark a row as selected by default", () => {
    renderRow({ name: "Policy.pdf", kind: "pdf", onActivate: vi.fn() });

    expect(screen.getByTestId("file-table-row")).toHaveAttribute("data-selected", "false");
    expect(screen.getByTestId("file-table-activate")).not.toHaveAttribute("aria-current");
  });

  it("is not a button without an activate handler", () => {
    renderRow({ name: "Policy.pdf", kind: "pdf" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("file-table-activate")).not.toHaveAttribute("tabindex");
  });

  it("is a button named by the file name when it can be activated", () => {
    renderRow({ name: "Policy.pdf", kind: "pdf", onActivate: vi.fn() });

    expect(screen.getByRole("button", { name: /Policy\.pdf/ })).toHaveAttribute("tabindex", "0");
  });

  it("activates on click, Enter and Space", () => {
    const onActivate = vi.fn();
    renderRow({ name: "Policy.pdf", kind: "pdf", onActivate });
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });

    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it("ignores other keys", () => {
    const onActivate = vi.fn();
    renderRow({ name: "Policy.pdf", kind: "pdf", onActivate });

    fireEvent.keyDown(screen.getByRole("button"), { key: "a" });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("uses only design tokens for colour", () => {
    renderRow({ name: "Policy.pdf", kind: "pdf", selected: true });

    const style = screen.getByTestId("file-table-row").getAttribute("style") ?? "";
    expect(style).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(style).toContain("var(--og-color-accent-soft)");
  });
});
