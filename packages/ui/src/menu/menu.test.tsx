// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { Menu } from "./menu.js";
import type { MenuItem } from "./types.js";

const renderMenu = (items: readonly MenuItem[] = [openItem(), deleteItem()]) =>
  renderWithI18n(
    <Menu
      label="Actions for Photos"
      items={items}
      triggerTestId="file-actions-trigger"
      menuTestId="file-actions-menu"
    />,
  );

const openItem = (onSelect = vi.fn()): MenuItem => ({
  id: "open",
  textId: "files.entryActions.open",
  icon: "open_in_new",
  tone: "default",
  testId: "file-action-open",
  onSelect,
});

const deleteItem = (onSelect = vi.fn()): MenuItem => ({
  id: "delete",
  textId: "files.entryActions.delete",
  icon: "delete",
  tone: "danger",
  testId: "file-action-delete",
  onSelect,
});

const trigger = () => screen.getByRole("button", { name: "Actions for Photos" });
const panel = () => screen.getByRole("menu", { hidden: true });
const menuItems = () => within(panel()).getAllByRole("menuitem", { hidden: true });

describe("Menu", () => {
  it("labels its trigger and starts closed", () => {
    renderMenu();

    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("data-testid", "file-actions-trigger");
    expect(panel()).not.toHaveAttribute("data-popover-open");
  });

  it("opens on click and focuses the first item", () => {
    renderMenu();

    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panel()).toHaveAttribute("data-popover-open");
    expect(menuItems()[0]).toHaveFocus();
  });

  it("closes when the trigger is clicked again", () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).not.toHaveAttribute("data-popover-open");
  });

  it("opens with ArrowDown on the first item and ArrowUp on the last", () => {
    renderMenu();

    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(menuItems()[0]).toHaveFocus();
    fireEvent.keyDown(menuItems()[0], { key: "Escape" });

    fireEvent.keyDown(trigger(), { key: "ArrowUp" });
    expect(menuItems()[1]).toHaveFocus();
  });

  it("moves the focus with the arrow keys, Home and End, wrapping at the ends", () => {
    renderMenu();
    fireEvent.click(trigger());
    const [first, second] = menuItems();

    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: "ArrowDown" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "ArrowUp" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: "Home" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "End" });
    expect(second).toHaveFocus();
  });

  it("closes on Escape and returns the focus to the trigger", () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.keyDown(menuItems()[0], { key: "Escape" });

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on Tab without trapping the focus", () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.keyDown(menuItems()[0], { key: "Tab" });

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("calls the item and closes the menu when an item is chosen", () => {
    const onSelect = vi.fn();
    renderMenu([openItem(onSelect), deleteItem()]);
    fireEvent.click(trigger());

    fireEvent.click(screen.getByTestId("file-action-open"));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the page is pressed outside the menu", () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.pointerDown(document.body);

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the menu open when its own trigger is pressed", () => {
    renderMenu();
    fireEvent.click(trigger());

    fireEvent.pointerDown(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("separates a danger item from the items above it", () => {
    renderMenu();

    expect(within(panel()).getByRole("separator", { hidden: true })).toBeInTheDocument();
    expect(screen.getByTestId("file-action-delete")).toHaveTextContent("Delete");
  });
});
