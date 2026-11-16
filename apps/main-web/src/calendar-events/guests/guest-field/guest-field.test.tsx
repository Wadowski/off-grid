// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuestCandidatesState } from "../types.js";
import { GuestField } from "./guest-field.js";

const BEN = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";

const readyState = (overrides: Partial<GuestCandidatesState> = {}): GuestCandidatesState => ({
  status: "ready",
  candidates: [{ userId: BEN, name: "Ben", familyId: "family-smiths", familyName: "The Smiths" }],
  retry: vi.fn(),
  ...overrides,
});

const renderField = (props: {
  selectedIds?: readonly string[];
  state?: GuestCandidatesState;
  disabled?: boolean;
  onToggle?: (userId: string) => void;
}) =>
  render(
    <GuestField
      selectedIds={props.selectedIds ?? []}
      candidatesState={props.state ?? readyState()}
      disabled={props.disabled ?? false}
      onToggle={props.onToggle ?? vi.fn()}
    />,
  );

describe("GuestField", () => {
  afterEach(() => cleanup());

  it("shows the selected count and a chip for each selected guest", () => {
    renderField({ selectedIds: [BEN] });

    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByTestId(`guest-chip-${BEN}`)).toHaveTextContent("Ben");
  });

  it("removes a guest from its chip", () => {
    const onToggle = vi.fn();
    renderField({ selectedIds: [BEN], onToggle });

    fireEvent.click(screen.getByTestId(`guest-chip-remove-${BEN}`));

    expect(onToggle).toHaveBeenCalledWith(BEN);
  });

  it("lists family members as options once Add guests is pressed", () => {
    renderField({});

    expect(screen.queryByTestId(`guest-option-${BEN}`)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("guest-field-add"));

    expect(screen.getByTestId(`guest-option-${BEN}`)).toBeInTheDocument();
    expect(screen.getByText("The Smiths")).toBeInTheDocument();
  });

  it("shows the family hint and no controls when disabled", () => {
    renderField({ selectedIds: [BEN], disabled: true });

    expect(screen.getByText("Guests can only be invited to personal events.")).toBeInTheDocument();
    expect(screen.queryByTestId("guest-field-add")).not.toBeInTheDocument();
  });

  it("says so when no family member can be invited", () => {
    renderField({ state: readyState({ candidates: [] }) });

    expect(
      screen.getByText(
        "You share no family with anyone yet. Join or create a family to invite people.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an alert with a retry when the candidates cannot be loaded", () => {
    const retry = vi.fn();
    renderField({ state: readyState({ status: "failed", retry }) });

    expect(screen.getByRole("alert")).toHaveTextContent("Guests could not be loaded");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
