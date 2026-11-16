// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuestReminders } from "./guest-reminders.js";

const saveButton = () => screen.getByRole("button", { name: /Save reminders|Saving/ });

describe("GuestReminders", () => {
  afterEach(cleanup);

  it("starts with the saved reminders and nothing to save", () => {
    render(<GuestReminders offsets={[30]} onSave={vi.fn()} />);

    expect(screen.getByTestId("reminder-amount-0")).toHaveValue(30);
    expect(saveButton()).toBeDisabled();
  });

  it("saves the changed reminders and disables the button again", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<GuestReminders offsets={[]} onSave={onSave} />);
    fireEvent.click(screen.getByTestId("reminder-add"));

    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledWith([15]));
    await waitFor(() => expect(saveButton()).toBeDisabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not allow saving while a reminder is invalid", () => {
    render(<GuestReminders offsets={[30]} onSave={vi.fn()} />);

    fireEvent.change(screen.getByTestId("reminder-amount-0"), { target: { value: "" } });

    expect(saveButton()).toBeDisabled();
  });

  it("says the reminders were not saved and keeps the button usable when saving fails", async () => {
    render(<GuestReminders offsets={[]} onSave={vi.fn().mockRejectedValue(new Error("down"))} />);
    fireEvent.click(screen.getByTestId("reminder-add"));

    fireEvent.click(saveButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save your reminders. Try again.",
    );
    expect(saveButton()).toBeEnabled();
  });
});
