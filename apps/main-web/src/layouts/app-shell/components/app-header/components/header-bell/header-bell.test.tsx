// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsInboxContext } from "../../../../../../notifications/inbox-context/notifications-inbox-context.js";
import type { NotificationsInbox } from "../../../../../../notifications/inbox-store/types.js";
import { HeaderBell } from "./header-bell.js";

const inboxWith = (overrides: Partial<NotificationsInbox>): NotificationsInbox => ({
  items: [],
  filters: { unread: false },
  nextCursor: null,
  unreadCount: 0,
  total: 0,
  status: "ready",
  errorKind: undefined,
  setFilters: vi.fn(),
  reload: vi.fn(async () => undefined),
  loadMore: vi.fn(async () => undefined),
  markRead: vi.fn(async () => undefined),
  markAllRead: vi.fn(async () => undefined),
  ...overrides,
});

const renderBell = (inbox: NotificationsInbox, onToggle = vi.fn(), isOpen = false) =>
  render(
    <NotificationsInboxContext.Provider value={inbox}>
      <HeaderBell isOpen={isOpen} onToggle={onToggle} />
    </NotificationsInboxContext.Provider>,
  );

const bell = () => screen.getByTestId("header-bell");

const ToggleableBell = ({ inbox }: { readonly inbox: NotificationsInbox }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <NotificationsInboxContext.Provider value={inbox}>
      <HeaderBell isOpen={isOpen} onToggle={() => setIsOpen((current) => !current)} />
    </NotificationsInboxContext.Provider>
  );
};

const renderToggleable = (inbox: NotificationsInbox) => render(<ToggleableBell inbox={inbox} />);

describe("HeaderBell", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the unread count in the badge", () => {
    renderBell(inboxWith({ unreadCount: 3 }));

    expect(screen.getByTestId("header-bell-badge")).toHaveTextContent("3");
  });

  it("shows 99+ when more than 99 notices are unread", () => {
    renderBell(inboxWith({ unreadCount: 120 }));

    expect(screen.getByTestId("header-bell-badge")).toHaveTextContent("99+");
  });

  it("shows 99 exactly at the cap", () => {
    renderBell(inboxWith({ unreadCount: 99 }));

    expect(screen.getByTestId("header-bell-badge")).toHaveTextContent(/^99$/);
  });

  it("hides the badge when nothing is unread", () => {
    renderBell(inboxWith({ unreadCount: 0 }));

    expect(screen.queryByTestId("header-bell-badge")).toBeNull();
  });

  it("hides the badge while the inbox is loading or failed to load", () => {
    const { unmount } = renderBell(inboxWith({ unreadCount: 4, status: "loading" }));
    expect(screen.queryByTestId("header-bell-badge")).toBeNull();
    unmount();

    renderBell(inboxWith({ unreadCount: 4, status: "error", errorKind: "load" }));
    expect(screen.queryByTestId("header-bell-badge")).toBeNull();
  });

  it("names the button by its real count when notices are unread", () => {
    renderBell(inboxWith({ unreadCount: 120 }));

    expect(bell()).toHaveAccessibleName("Notifications, 120 unread");
  });

  it("names the button Notifications when nothing is unread", () => {
    renderBell(inboxWith({ unreadCount: 0 }));

    expect(bell()).toHaveAccessibleName("Notifications");
  });

  it("is enabled and reports its open state", () => {
    renderBell(inboxWith({ unreadCount: 2 }), vi.fn(), true);

    expect(bell()).toBeEnabled();
    expect(bell()).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    renderBell(inboxWith({}), onToggle);

    fireEvent.click(bell());

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("toggles aria-expanded on each click", () => {
    renderToggleable(inboxWith({ unreadCount: 1 }));

    expect(bell()).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(bell());
    expect(bell()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(bell());
    expect(bell()).toHaveAttribute("aria-expanded", "false");
  });

  it("has no axe violations", async () => {
    const { container } = renderBell(inboxWith({ unreadCount: 5 }));

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  });
});
