// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FileRow } from "./file-row.js";

const NOW = new Date("2026-11-17T12:00:00Z");
const YESTERDAY = new Date("2026-11-16T09:00:00Z");

describe("FileRow", () => {
  it("shows the name, size and last change of a file", () => {
    renderWithI18n(
      <FileRow
        name="Policy.pdf"
        kind="pdf"
        sizeBytes={2_800_000}
        modifiedAt={YESTERDAY}
        locale="en"
        now={NOW}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("file-name")).toHaveTextContent("Policy.pdf");
    expect(screen.getByTestId("file-size")).toHaveTextContent("2.8 MB");
    expect(screen.getByTestId("file-modified")).toHaveTextContent("Yesterday");
    expect(screen.getByTestId("file-type-icon")).toHaveAttribute("data-kind", "pdf");
  });

  it("shows the number of items of a folder and no size", () => {
    renderWithI18n(<FileRow name="Photos" kind="folder" itemCount={184} sizeBytes={10} />);

    expect(screen.getByTestId("file-item-count")).toHaveTextContent("184 items");
  });

  it("uses the singular for one item", () => {
    renderWithI18n(<FileRow name="Photos" kind="folder" itemCount={1} />);

    expect(screen.getByTestId("file-item-count")).toHaveTextContent("1 item");
  });

  it("leaves out the size and the change when they are unknown", () => {
    renderWithI18n(<FileRow name="Draft" kind="generic" />);

    expect(screen.queryByTestId("file-size")).not.toBeInTheDocument();
    expect(screen.queryByTestId("file-modified")).not.toBeInTheDocument();
  });

  it("keeps a long name on one line and readable in full through its title", () => {
    const name = "a-very-long-file-name-".repeat(10);
    renderWithI18n(<FileRow name={name} kind="document" />);

    const label = screen.getByTestId("file-name");
    expect(label).toHaveAttribute("title", name);
    expect(label.style.textOverflow).toBe("ellipsis");
    expect(label.style.whiteSpace).toBe("nowrap");
  });

  it("marks a selected row", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" selected />);

    expect(screen.getByTestId("file-row")).toHaveAttribute("data-selected", "true");
  });

  it("does not mark a row as selected by default", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" />);

    expect(screen.getByTestId("file-row")).toHaveAttribute("data-selected", "false");
  });

  it("shows the trailing content", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" trailing={<button>More</button>} />);

    expect(
      within(screen.getByTestId("file-row-trailing")).getByRole("button", { name: "More" }),
    ).toBeInTheDocument();
  });

  it("has no trailing area without trailing content", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" />);

    expect(screen.queryByTestId("file-row-trailing")).not.toBeInTheDocument();
  });

  it("is not a button without an activate handler", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByTestId("file-row-activate")).not.toHaveAttribute("tabindex");
  });

  it("is a button named by the file name when it can be activated", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" onActivate={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Policy.pdf" })).toHaveAttribute("tabindex", "0");
  });

  it("activates on click, Enter and Space", () => {
    const onActivate = vi.fn();
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" onActivate={onActivate} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });

    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it("ignores other keys", () => {
    const onActivate = vi.fn();
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" onActivate={onActivate} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "a" });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not activate from the trailing content", () => {
    const onActivate = vi.fn();
    renderWithI18n(
      <FileRow
        name="Policy.pdf"
        kind="pdf"
        onActivate={onActivate}
        trailing={<button>More</button>}
      />,
    );
    const more = screen.getByRole("button", { name: "More" });

    fireEvent.click(more);
    fireEvent.keyDown(more, { key: "Enter" });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("uses only design tokens for colour", () => {
    renderWithI18n(<FileRow name="Policy.pdf" kind="pdf" selected />);

    const style = screen.getByTestId("file-row").getAttribute("style") ?? "";
    expect(style).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(style).toContain("var(--og-color-accent-soft)");
  });
});
