// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarForm } from "./calendar-form.js";
import type { CalendarSaveStatus } from "../../calendars/types.js";

const FAMILIES = [{ id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f", name: "The Smiths" }];

const renderCreate = (status: CalendarSaveStatus = "idle") => {
  const onSubmit = vi.fn(async () => undefined);
  render(
    <CalendarForm
      mode="create"
      families={FAMILIES}
      status={status}
      submitTextId="calendar.calendars.create"
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
};

const submit = () => fireEvent.click(screen.getByTestId("calendar-submit"));

describe("CalendarForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers the six calendar colors, with blue selected by default", () => {
    renderCreate();

    const swatches = ["blue", "teal", "green", "amber", "rose", "violet"].map((color) =>
      screen.getByTestId(`calendar-color-${color}`),
    );
    expect(swatches).toHaveLength(6);
    expect(swatches[0]).toHaveAttribute("aria-pressed", "true");
    expect(swatches[1]).toHaveAttribute("aria-pressed", "false");
  });

  it("refuses an empty or blank name and does not submit", async () => {
    const onSubmit = renderCreate();

    fireEvent.change(screen.getByPlaceholderText("Enter a calendar name"), {
      target: { value: "   " },
    });
    submit();

    expect(await screen.findByText("Enter a calendar name.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the trimmed name, the chosen color and no family for Just me", async () => {
    const onSubmit = renderCreate();

    fireEvent.change(screen.getByPlaceholderText("Enter a calendar name"), {
      target: { value: "  Studio  " },
    });
    fireEvent.click(screen.getByTestId("calendar-color-teal"));
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Studio", color: "teal", familyId: undefined });
  });

  it("offers each family as an owner in create mode and sends the chosen family", async () => {
    const onSubmit = renderCreate();

    const owner = screen.getByTestId("calendar-owner");
    expect(within(owner).getByRole("option", { name: "Just me" })).toBeInTheDocument();
    expect(within(owner).getByRole("option", { name: "The Smiths" })).toBeInTheDocument();
    fireEvent.change(owner, { target: { value: FAMILIES[0]!.id } });
    fireEvent.change(screen.getByPlaceholderText("Enter a calendar name"), {
      target: { value: "Kitchen" },
    });
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Kitchen",
      color: "blue",
      familyId: FAMILIES[0]!.id,
    });
  });

  it("shows the owner as text in edit mode and never sends a family", async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(
      <CalendarForm
        mode="edit"
        ownerFamilyName="The Smiths"
        initialValues={{ name: "Kitchen", color: "amber" }}
        status="idle"
        submitTextId="calendar.actions.save"
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByTestId("calendar-owner")).not.toBeInTheDocument();
    expect(screen.getByText("The Smiths")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-color-amber")).toHaveAttribute("aria-pressed", "true");
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Kitchen", color: "amber", familyId: undefined });
  });

  it("shows the failure text when saving fails", () => {
    renderCreate("failed");

    expect(screen.getByText("Something went wrong. Try again.")).toBeInTheDocument();
  });
});
