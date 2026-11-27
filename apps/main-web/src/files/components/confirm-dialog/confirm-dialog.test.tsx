// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog.js";
import type { ConfirmDialogProps } from "./types.js";

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

const renderDialog = (overrides: Partial<ConfirmDialogProps> = {}) => {
  const props: ConfirmDialogProps = {
    testIdPrefix: "purge",
    titleTextId: "files.trash.purgeDialog.title",
    bodyTextId: "files.trash.purgeDialog.bodyFile",
    bodyValues: { name: "Old receipt.pdf" },
    noteTextId: null,
    cancelTextId: "files.delete.cancel",
    confirmTextId: "files.trash.purgeDialog.confirm",
    narrow: false,
    pending: false,
    errorTextId: null,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<ConfirmDialog {...props} />);
  return props;
};

describe("ConfirmDialog", () => {
  it("is labelled by its title and names the entry in its body", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Delete permanently?" })).toBeInTheDocument();
    expect(screen.getByText(/Old receipt\.pdf/)).toBeInTheDocument();
  });

  it("uses a test id built from its prefix", () => {
    renderDialog();

    expect(screen.getByTestId("purge-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("purge-confirm")).toBeInTheDocument();
    expect(screen.getByTestId("purge-cancel")).toBeInTheDocument();
  });

  it("calls confirm from the confirm button", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("purge-confirm"));

    expect(props.onConfirm).toHaveBeenCalledOnce();
  });

  it("calls cancel from the cancel button and closes the dialog", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("purge-cancel"));

    expect(props.onCancel).toHaveBeenCalledOnce();
    expect(screen.getByTestId("purge-dialog")).not.toHaveAttribute("open");
  });

  it("disables confirm and ignores cancel while pending", () => {
    const props = renderDialog({ pending: true });
    const dialog = screen.getByTestId("purge-dialog");

    expect(screen.getByTestId("purge-confirm")).toBeDisabled();
    fireEvent.click(screen.getByTestId("purge-cancel"));
    fireEvent.click(dialog);

    expect(dialog).toHaveAttribute("open");
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("keeps the dialog open on Escape while pending", () => {
    const props = renderDialog({ pending: true });

    const notPrevented = fireEvent(
      screen.getByRole("dialog", { hidden: true }),
      new Event("cancel", { cancelable: true }),
    );

    expect(notPrevented).toBe(false);
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("shows the mapped error as an alert", () => {
    renderDialog({ errorTextId: "files.errors.notTrashed" });

    expect(screen.getByTestId("purge-error")).toHaveTextContent("This item isn't in the trash.");
  });
});
