// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilePickerButton } from "./file-picker-button.js";

const renderPicker = (onFilesPicked = vi.fn(), disabled = false) =>
  render(
    <FilePickerButton
      ariaLabel="Upload"
      onFilesPicked={onFilesPicked}
      disabled={disabled}
      testId="picker"
      inputTestId="picker-input"
    >
      Upload
    </FilePickerButton>,
  );

describe("FilePickerButton", () => {
  it("passes every picked file to onFilesPicked in pick order", () => {
    const onFilesPicked = vi.fn();
    renderPicker(onFilesPicked);
    const first = new File(["a"], "a.txt");
    const second = new File(["b"], "b.txt");

    fireEvent.change(screen.getByTestId("picker-input"), { target: { files: [first, second] } });

    expect(onFilesPicked).toHaveBeenCalledWith([first, second]);
  });

  it("allows picking several files at once", () => {
    renderPicker();

    expect(screen.getByTestId("picker-input")).toHaveAttribute("multiple");
  });

  it("clears the input value so the same file can be picked again", () => {
    renderPicker();
    const input = screen.getByTestId("picker-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [new File(["a"], "a.txt")] } });

    expect(input.value).toBe("");
  });

  it("does not call onFilesPicked when the picked list is empty", () => {
    const onFilesPicked = vi.fn();
    renderPicker(onFilesPicked);

    fireEvent.change(screen.getByTestId("picker-input"), { target: { files: [] } });

    expect(onFilesPicked).not.toHaveBeenCalled();
  });

  it("opens the file chooser from the button", () => {
    renderPicker();
    const input = screen.getByTestId("picker-input");
    const click = vi.spyOn(input, "click");

    fireEvent.click(screen.getByTestId("picker"));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("is disabled with the button and keeps the input out of the tab order", () => {
    renderPicker(vi.fn(), true);

    expect(screen.getByTestId("picker")).toBeDisabled();
    expect(screen.getByTestId("picker-input")).toBeDisabled();
    expect(screen.getByTestId("picker-input")).toHaveAttribute("tabindex", "-1");
  });
});
