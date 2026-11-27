// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PurgeEntryDialog } from "./purge-entry-dialog.js";
import type { PurgeEntryDialogProps } from "./types.js";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

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
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

const renderDialog = (overrides: Partial<PurgeEntryDialogProps> = {}) => {
  const props: PurgeEntryDialogProps = {
    name: "Old receipt.pdf",
    isFolder: false,
    narrow: false,
    pending: false,
    errorTextId: null,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<PurgeEntryDialog {...props} />);
  return props;
};

describe("PurgeEntryDialog", () => {
  it("names the file, says it cannot be undone and gives the retention note", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Delete permanently?" })).toBeInTheDocument();
    expect(screen.getByText(/Old receipt\.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/This can't be undone\./)).toBeInTheDocument();
    expect(
      screen.getByText("Items in the trash are also removed automatically after 30 days."),
    ).toBeInTheDocument();
  });

  it("says that everything inside a folder goes too", () => {
    renderDialog({ name: "Holiday", isFolder: true });

    expect(
      screen.getByText(/the folder "Holiday" and everything in it permanently/),
    ).toBeInTheDocument();
  });

  it("confirms from the danger button", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("purge-confirm"));

    expect(props.onConfirm).toHaveBeenCalledOnce();
  });
});
