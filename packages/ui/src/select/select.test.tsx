// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select.js";

describe("Select", () => {
  it("offers each option and reports the chosen value", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Role" defaultValue="member" onChange={onChange}>
        <option value="admin">Admin</option>
        <option value="member">Member</option>
      </Select>,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Role" }), {
      target: { value: "admin" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes its test id to the select", () => {
    render(
      <Select aria-label="Role" data-testid="role-select">
        <option value="member">Member</option>
      </Select>,
    );

    expect(screen.getByTestId("role-select").tagName).toBe("SELECT");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(
      <Select aria-label="Role">
        <option value="member">Member</option>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveClass("og-focusable");
  });
});
