// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteVersionConfirm } from "./delete-version-confirm.js";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

describe("DeleteVersionConfirm", () => {
  it("asks for the version number and only the confirm action deletes it", () => {
    const onConfirm = vi.fn();
    render(<DeleteVersionConfirm versionNumber={2} onCancel={vi.fn()} onConfirm={onConfirm} />);

    expect(screen.getByText("Delete version 2?")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("delete-version-confirm-action"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not delete when the cancel action is pressed", () => {
    const onConfirm = vi.fn();
    render(<DeleteVersionConfirm versionNumber={2} onCancel={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByTestId("delete-version-cancel"));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("stops Escape inside the dialog from reaching the surrounding panel", () => {
    const onPanelKeyDown = vi.fn();
    render(
      <div onKeyDown={onPanelKeyDown}>
        <DeleteVersionConfirm versionNumber={2} onCancel={vi.fn()} onConfirm={vi.fn()} />
      </div>,
    );

    fireEvent.keyDown(screen.getByTestId("delete-version-cancel"), { key: "Escape" });

    expect(onPanelKeyDown).not.toHaveBeenCalled();
  });
});
