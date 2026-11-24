// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteEntryDialog } from "./delete-entry-dialog.js";
import type { DeleteEntryDialogProps } from "./types.js";

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

const renderDialog = (overrides: Partial<DeleteEntryDialogProps> = {}) => {
  const props: DeleteEntryDialogProps = {
    name: "Insurance policy.txt",
    isFolder: false,
    narrow: false,
    pending: false,
    errorTextId: null,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<DeleteEntryDialog {...props} />);
  return props;
};

describe("DeleteEntryDialog", () => {
  it("names the file it will move to the trash", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Move to trash?" })).toBeInTheDocument();
    expect(screen.getByText(/Insurance policy\.txt/)).toBeInTheDocument();
    expect(screen.getByText(/You can restore it from the trash later/)).toBeInTheDocument();
  });

  it("says that everything inside a folder goes too", () => {
    renderDialog({ name: "Photos", isFolder: true });

    expect(screen.getByText(/Move the folder "Photos" and everything in it/)).toBeInTheDocument();
  });

  it("confirms only through the confirm action", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("delete-entry-confirm"));

    expect(props.onConfirm).toHaveBeenCalledOnce();
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("disables the confirm action while the move is running", () => {
    renderDialog({ pending: true });

    expect(screen.getByTestId("delete-entry-confirm")).toBeDisabled();
  });

  it("shows the mapped error as an alert", () => {
    renderDialog({ errorTextId: "files.errors.notFound" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
  });

  it("shows no alert before a failure", () => {
    renderDialog();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("cancels with the cancel button and reports it once", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("delete-entry-cancel"));

    expect(props.onCancel).toHaveBeenCalledOnce();
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("reports cancel when Escape closes the dialog", () => {
    const props = renderDialog();

    fireEvent(screen.getByRole("dialog", { hidden: true }), new Event("close"));

    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open on Escape while the move is running", () => {
    const props = renderDialog({ pending: true });
    const dialog = screen.getByRole("dialog", { hidden: true });

    const notPrevented = fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(notPrevented).toBe(false);
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("ignores the cancel button and a backdrop click while the move is running", () => {
    const props = renderDialog({ pending: true });
    const dialog = screen.getByTestId("delete-entry-dialog");

    fireEvent.click(screen.getByTestId("delete-entry-cancel"));
    fireEvent.click(dialog);

    expect(dialog).toHaveAttribute("open");
    expect(props.onCancel).not.toHaveBeenCalled();
  });
});
