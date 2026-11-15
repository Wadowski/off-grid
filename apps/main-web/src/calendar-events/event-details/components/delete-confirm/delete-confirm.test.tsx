// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteConfirm } from "./delete-confirm.js";

const originalShowModal = HTMLDialogElement.prototype.showModal;

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
});

afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
});

describe("DeleteConfirm", () => {
  it("asks before deleting and only the confirm action deletes", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <DeleteConfirm
        narrow={false}
        deleting={false}
        failed={false}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Delete this event?")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete event" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
