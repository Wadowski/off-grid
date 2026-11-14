// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog.js";

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

describe("Dialog", () => {
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

  it("opens as a modal as soon as it is shown", () => {
    render(
      <Dialog labelledBy="title" onClose={vi.fn()} testId="dialog">
        <h2 id="title">Invite</h2>
      </Dialog>,
    );

    expect(screen.getByTestId("dialog")).toHaveAttribute("open");
  });

  it("names itself with the element it is labelled by", () => {
    render(
      <Dialog labelledBy="title" onClose={vi.fn()}>
        <h2 id="title">Invite</h2>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Invite" })).toBeInTheDocument();
  });

  it("calls onClose when the dialog closes", () => {
    const onClose = vi.fn();
    render(
      <Dialog labelledBy="title" onClose={onClose} testId="dialog">
        <h2 id="title">Invite</h2>
      </Dialog>,
    );

    (screen.getByTestId("dialog") as HTMLDialogElement).close();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("lets its owner close it through the dialog ref", () => {
    const onClose = vi.fn();
    const Owner = () => {
      const dialogRef = useRef<HTMLDialogElement>(null);
      return (
        <Dialog labelledBy="title" onClose={onClose} dialogRef={dialogRef} testId="dialog">
          <h2 id="title">Invite</h2>
          <button type="button" onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </Dialog>
      );
    };
    render(<Owner />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByTestId("dialog")).not.toHaveAttribute("open");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a backdrop click only when asked to, and not on a click inside", () => {
    const { rerender } = render(
      <Dialog labelledBy="title" onClose={vi.fn()} testId="dialog">
        <h2 id="title">Invite</h2>
      </Dialog>,
    );
    fireEvent.click(screen.getByTestId("dialog"));
    expect(screen.getByTestId("dialog")).toHaveAttribute("open");

    rerender(
      <Dialog labelledBy="title" onClose={vi.fn()} dismissOnBackdropClick testId="dialog">
        <h2 id="title">Invite</h2>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("heading", { name: "Invite" }));
    expect(screen.getByTestId("dialog")).toHaveAttribute("open");

    fireEvent.click(screen.getByTestId("dialog"));
    expect(screen.getByTestId("dialog")).not.toHaveAttribute("open");
  });
});
