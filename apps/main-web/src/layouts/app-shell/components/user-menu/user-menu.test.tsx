// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "../../../../types.js";
import { UserMenu } from "./user-menu.js";

const member: CurrentUser = { name: "Anna Kowalska", email: "anna@example.com", role: "member" };
const admin: CurrentUser = { name: "Piotr Nowak", email: "piotr@example.com", role: "admin" };

const renderMenu = (user: CurrentUser, onSignOut = vi.fn()) =>
  render(
    <MemoryRouter>
      <UserMenu user={user} onSignOut={onSignOut} />
    </MemoryRouter>,
  );

describe("UserMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the initials and opens a menu with the name, email and role", () => {
    renderMenu(member);

    const trigger = screen.getByRole("button", { name: "Account menu" });
    expect(trigger).toHaveTextContent("AK");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Account" });
    expect(menu).toHaveTextContent("Anna Kowalska");
    expect(menu).toHaveTextContent("anna@example.com");
    expect(menu).toHaveTextContent("Member");
  });

  it("offers admin settings only to admins", () => {
    const { unmount } = renderMenu(admin);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menuitem", { name: "Admin settings" })).toBeInTheDocument();
    unmount();

    renderMenu(member);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.queryByRole("menuitem", { name: "Admin settings" })).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderMenu(member);
    const trigger = screen.getByRole("button", { name: "Account menu" });
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("signs out through the sign out item", () => {
    const onSignOut = vi.fn();
    renderMenu(member, onSignOut);
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
