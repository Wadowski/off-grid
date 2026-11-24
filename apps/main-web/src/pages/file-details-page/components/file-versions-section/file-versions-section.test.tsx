// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileVersionRow } from "../../../../files/types.js";
import { FileVersionsSection } from "./file-versions-section.js";
import type { FileVersionsSectionProps } from "./types.js";

const ROWS: readonly FileVersionRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000003" as FileVersionRow["id"],
    number: 3,
    sizeBytes: 30,
    createdAt: new Date("2026-03-03T10:00:00.000Z"),
    authorName: "Anna",
    isCurrent: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000001" as FileVersionRow["id"],
    number: 1,
    sizeBytes: 10,
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    authorName: null,
    isCurrent: false,
  },
];

const callbacks = () => ({
  onUploadPicked: vi.fn(),
  onRetry: vi.fn(async () => undefined),
  onRestore: vi.fn(),
  onDownload: vi.fn(),
  onDelete: vi.fn(),
});

const sectionWith = (
  overrides: Partial<FileVersionsSectionProps> = {},
): FileVersionsSectionProps => ({
  variant: "panel",
  fileName: "Notes.txt",
  rows: ROWS,
  status: "ready",
  pendingVersionId: null,
  errorTextId: null,
  completed: null,
  ...callbacks(),
  ...overrides,
});

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

describe("FileVersionsSection", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  afterEach(() => {
    cleanup();
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it("lists the versions newest first with the current one marked", () => {
    render(<FileVersionsSection {...sectionWith()} />);

    const rows = screen.getAllByTestId("file-version-row");
    expect(rows.map((row) => row.getAttribute("data-version"))).toEqual(["3", "1"]);
    expect(within(rows[0] as HTMLElement).getByTestId("file-version-current")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).queryByTestId("file-version-current")).toBeNull();
    expect(screen.getByText(/ by Anna$/)).toBeInTheDocument();
    expect(screen.getByText("Version 3")).toBeInTheDocument();
  });

  it("offers no restore or delete action on the current version", () => {
    render(<FileVersionsSection {...sectionWith()} />);

    const [current, earlier] = screen.getAllByTestId("file-version-row");
    expect(within(current as HTMLElement).queryByTestId("file-version-delete")).toBeNull();
    expect(within(current as HTMLElement).queryByTestId("file-version-restore")).toBeNull();
    expect(within(current as HTMLElement).getByTestId("file-version-download")).toBeInTheDocument();
    expect(within(earlier as HTMLElement).getByTestId("file-version-restore")).toBeInTheDocument();
    expect(within(earlier as HTMLElement).getByTestId("file-version-delete")).toBeInTheDocument();
  });

  it("labels each action with its version number", () => {
    render(<FileVersionsSection {...sectionWith()} />);

    expect(screen.getByRole("button", { name: "Restore version 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download version 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete version 1" })).toBeInTheDocument();
  });

  it("restores and downloads the version the row belongs to", () => {
    const props = callbacks();
    render(<FileVersionsSection {...sectionWith(props)} />);

    fireEvent.click(screen.getByRole("button", { name: "Restore version 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Download version 1" }));

    expect(props.onRestore).toHaveBeenCalledWith(ROWS[1]);
    expect(props.onDownload).toHaveBeenCalledWith(ROWS[1]);
  });

  it("asks before deleting and deletes after confirmation", () => {
    const props = callbacks();
    render(<FileVersionsSection {...sectionWith(props)} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete version 1" }));
    expect(screen.getByTestId("delete-version-confirm")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("delete-version-confirm-action"));

    expect(props.onDelete).toHaveBeenCalledWith(ROWS[1]);
  });

  it("keeps the version when the delete is cancelled", () => {
    const props = callbacks();
    render(<FileVersionsSection {...sectionWith(props)} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete version 1" }));
    fireEvent.click(screen.getByTestId("delete-version-cancel"));

    expect(props.onDelete).not.toHaveBeenCalled();
    expect(screen.getAllByTestId("file-version-row")).toHaveLength(2);
  });

  it("shows the loading text while the versions load", () => {
    render(<FileVersionsSection {...sectionWith({ rows: [], status: "loading" })} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("file-version-row")).toBeNull();
  });

  it("shows the failure with a retry that asks the caller to reload", () => {
    const props = callbacks();
    render(<FileVersionsSection {...sectionWith({ ...props, rows: [], status: "failed" })} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Versions could not be loaded.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows an action failure as an alert", () => {
    render(
      <FileVersionsSection {...sectionWith({ errorTextId: "files.errors.currentVersion" })} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The current version of a file cannot be deleted.",
    );
  });

  it("announces a completed restore", () => {
    render(
      <FileVersionsSection
        {...sectionWith({ completed: { kind: "restored", versionNumber: 1 } })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Version 1 restored");
  });

  it("disables the actions of the row that is pending", () => {
    render(<FileVersionsSection {...sectionWith({ pendingVersionId: ROWS[1]?.id ?? null })} />);

    const [, earlier] = screen.getAllByTestId("file-version-row");
    expect(earlier).toHaveAttribute("aria-busy", "true");
    expect(within(earlier as HTMLElement).getByTestId("file-version-restore")).toBeDisabled();
  });
});
