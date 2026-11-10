// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select.js";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

describe("Select", () => {
  it("renders one option per entry with its label", () => {
    render(<Select aria-label="Role" options={ROLE_OPTIONS} />);

    expect(screen.getByRole("option", { name: "Admin" })).toHaveValue("admin");
    expect(screen.getByRole("option", { name: "Member" })).toHaveValue("member");
  });

  it("reports the chosen value", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Role" options={ROLE_OPTIONS} defaultValue="member" onChange={onChange} />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Role" }), {
      target: { value: "admin" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes its test id to the select", () => {
    render(<Select aria-label="Role" options={ROLE_OPTIONS} data-testid="role-select" />);

    expect(screen.getByTestId("role-select").tagName).toBe("SELECT");
  });

  it("keeps the focus ring class so the shared focus style applies", () => {
    render(<Select aria-label="Role" options={ROLE_OPTIONS} />);

    expect(screen.getByRole("combobox")).toHaveClass("og-focusable");
  });
});
