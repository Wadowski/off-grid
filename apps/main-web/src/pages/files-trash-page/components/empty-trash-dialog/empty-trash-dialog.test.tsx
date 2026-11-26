// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmptyTrashDialog } from "./empty-trash-dialog.js";
import type { EmptyTrashDialogProps } from "./types.js";

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

const renderDialog = (overrides: Partial<EmptyTrashDialogProps> = {}) => {
  const props: EmptyTrashDialogProps = {
    narrow: false,
    pending: false,
    errorTextId: null,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<EmptyTrashDialog {...props} />);
  return props;
};

describe("EmptyTrashDialog", () => {
  it("says everything in the trash of this drive is deleted for good", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Empty the trash?" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Everything in the trash of this drive will be deleted permanently. This can't be undone.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Items in the trash are also removed automatically after 30 days."),
    ).toBeInTheDocument();
  });

  it("confirms from the danger button", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByTestId("empty-trash-confirm"));

    expect(props.onConfirm).toHaveBeenCalledOnce();
  });
});
