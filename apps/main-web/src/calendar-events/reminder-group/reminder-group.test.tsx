// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReminderGroup } from "./reminder-group.js";

const renderGroup = (
  props: Partial<{ offsets: readonly number[]; disabled: boolean; submitAttempt: number }> = {},
) => {
  const onChange = vi.fn();
  const view = render(
    <ReminderGroup
      offsets={props.offsets ?? []}
      disabled={props.disabled ?? false}
      submitAttempt={props.submitAttempt ?? 0}
      onChange={onChange}
    />,
  );
  return { onChange, ...view };
};

const amountOf = (index: number) => screen.getByTestId(`reminder-amount-${index}`);
const unitOf = (index: number) => screen.getByTestId(`reminder-unit-${index}`);
const addButton = () => screen.getByTestId("reminder-add");

describe("ReminderGroup", () => {
  afterEach(cleanup);

  it("starts empty with the no-reminders text and an enabled add button", () => {
    renderGroup();

    expect(screen.getByRole("group", { name: "Reminders" })).toBeInTheDocument();
    expect(
      screen.getByText("No reminders. You will not be notified about this event."),
    ).toBeInTheDocument();
    expect(addButton()).toBeEnabled();
  });

  it("shows stored offsets in the largest unit that divides them evenly", () => {
    renderGroup({ offsets: [90, 120, 40320] });

    expect(amountOf(0)).toHaveValue(90);
    expect(unitOf(0)).toHaveValue("minute");
    expect(amountOf(1)).toHaveValue(2);
    expect(unitOf(1)).toHaveValue("hour");
    expect(amountOf(2)).toHaveValue(4);
    expect(unitOf(2)).toHaveValue("week");
  });

  it("adds a row of 15 minutes, reports it and moves focus to its number field", () => {
    const { onChange } = renderGroup();

    fireEvent.click(addButton());

    expect(amountOf(0)).toHaveValue(15);
    expect(unitOf(0)).toHaveValue("minute");
    expect(onChange).toHaveBeenLastCalledWith([15], true);
    expect(amountOf(0)).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Reminder added");
  });

  it("converts a changed number and unit to minutes", () => {
    const { onChange } = renderGroup({ offsets: [15] });

    fireEvent.change(amountOf(0), { target: { value: "2" } });
    fireEvent.change(unitOf(0), { target: { value: "day" } });

    expect(onChange).toHaveBeenLastCalledWith([2880], true);
  });

  it("removes a row, announces it and moves focus to the add button", () => {
    const { onChange } = renderGroup({ offsets: [15] });

    fireEvent.click(screen.getByTestId("reminder-remove-0"));

    expect(onChange).toHaveBeenLastCalledWith([], true);
    expect(screen.queryByTestId("reminder-row-0")).not.toBeInTheDocument();
    expect(addButton()).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Reminder removed");
  });

  it("moves focus to the next row's number field after removing a row in the middle", () => {
    renderGroup({ offsets: [15, 30] });

    fireEvent.click(screen.getByTestId("reminder-remove-0"));

    expect(amountOf(0)).toHaveValue(30);
    expect(amountOf(0)).toHaveFocus();
  });

  it("disables add at five reminders and explains the limit", () => {
    renderGroup({ offsets: [1, 2, 3, 4, 5] });

    expect(addButton()).toBeDisabled();
    expect(addButton()).toHaveAccessibleDescription("You can set up to 5 reminders.");
  });

  it("disables every control while saving", () => {
    renderGroup({ offsets: [15], disabled: true });

    expect(amountOf(0)).toBeDisabled();
    expect(unitOf(0)).toBeDisabled();
    expect(screen.getByTestId("reminder-remove-0")).toBeDisabled();
    expect(addButton()).toBeDisabled();
  });

  it("names each row and its controls for assistive technology", () => {
    renderGroup({ offsets: [15, 30] });

    const second = screen.getByRole("group", { name: "Reminder 2 of 2" });
    expect(within(second).getByLabelText("Amount")).toHaveValue(30);
    expect(within(second).getByLabelText("Unit")).toHaveValue("minute");
    expect(within(second).getByRole("button", { name: "Remove reminder" })).toBeInTheDocument();
  });

  it.each([
    ["", "Enter a number."],
    ["1.5", "Enter a whole number."],
    ["-1", "Enter 0 or more."],
    ["40321", "Use at most 4 weeks (40320 minutes)."],
  ])("flags the number %j as invalid and links the message to the field", (value, message) => {
    const { onChange } = renderGroup({ offsets: [15] });

    fireEvent.change(amountOf(0), { target: { value } });

    expect(amountOf(0)).toHaveAttribute("aria-invalid", "true");
    expect(amountOf(0)).toHaveAccessibleDescription(message);
    expect(onChange).toHaveBeenLastCalledWith([], false);
  });

  it("flags the second of two reminders at the same time across units", () => {
    const { onChange } = renderGroup({ offsets: [60, 15] });

    fireEvent.change(amountOf(1), { target: { value: "60" } });

    expect(amountOf(0)).not.toHaveAttribute("aria-invalid", "true");
    expect(amountOf(1)).toHaveAccessibleDescription("You already have a reminder at this time.");
    expect(onChange).toHaveBeenLastCalledWith([60], false);
  });

  it("explains that 0 means the start of the event", () => {
    renderGroup({ offsets: [15] });

    fireEvent.change(amountOf(0), { target: { value: "0" } });

    expect(screen.getByText("0 sends the reminder when the event starts.")).toBeInTheDocument();
  });

  it("moves focus to the first invalid field after a save attempt", () => {
    const view = renderGroup({ offsets: [15, 30] });
    fireEvent.change(amountOf(1), { target: { value: "" } });
    fireEvent.change(amountOf(0), { target: { value: "-1" } });

    view.rerender(
      <ReminderGroup offsets={[15, 30]} disabled={false} submitAttempt={1} onChange={vi.fn()} />,
    );

    expect(amountOf(0)).toHaveFocus();
  });
});
