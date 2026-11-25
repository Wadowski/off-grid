// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FolderForm } from "./folder-form.js";
import type { FolderFormProps } from "./types.js";

const renderForm = (overrides: Partial<FolderFormProps> = {}) => {
  const props: FolderFormProps = {
    status: "idle",
    errorTextId: null,
    onSubmit: vi.fn(async () => undefined),
    onCancel: vi.fn(),
    ...overrides,
  };
  render(<FolderForm {...props} />);
  return props;
};

const typeName = (value: string) =>
  fireEvent.change(screen.getByTestId("new-folder-name"), { target: { value } });

describe("FolderForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("focuses the name field when it opens", () => {
    renderForm();

    expect(screen.getByTestId("new-folder-name")).toHaveFocus();
  });

  it("shows the required message and does not submit an empty name", () => {
    const props = renderForm();

    fireEvent.click(screen.getByTestId("new-folder-submit"));

    expect(screen.getByText("Enter a name for the folder.")).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it("keeps the typed name when it is refused", () => {
    renderForm();
    typeName("Work/2026");

    fireEvent.click(screen.getByTestId("new-folder-submit"));

    expect(screen.getByText("A name can't contain slashes or be only dots.")).toBeInTheDocument();
    expect(screen.getByTestId("new-folder-name")).toHaveValue("Work/2026");
  });

  it("submits the trimmed name", async () => {
    const props = renderForm();
    typeName("  Holiday  ");

    fireEvent.click(screen.getByTestId("new-folder-submit"));

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledWith("Holiday"));
  });

  it("shows the error text it is given", () => {
    renderForm({ status: "failed", errorTextId: "files.errors.nameTaken" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A file or folder with this name already exists here.",
    );
  });

  it("disables submit while the request runs", () => {
    renderForm({ status: "submitting" });

    expect(screen.getByTestId("new-folder-submit")).toBeDisabled();
    expect(screen.getByTestId("new-folder-submit")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });

  it("calls onCancel from the Cancel button", () => {
    const props = renderForm();

    fireEvent.click(screen.getByTestId("new-folder-cancel"));

    expect(props.onCancel).toHaveBeenCalledOnce();
  });
});
