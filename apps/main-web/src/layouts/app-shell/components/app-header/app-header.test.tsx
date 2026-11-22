// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsInboxContext } from "../../../../notifications/inbox-context/notifications-inbox-context.js";
import type { NotificationsInbox } from "../../../../notifications/inbox-store/types.js";
import { AppHeader } from "./app-header.js";

const inbox: NotificationsInbox = {
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
};

const renderHeader = () =>
  render(
    <NotificationsInboxContext.Provider value={inbox}>
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    </NotificationsInboxContext.Provider>,
  );

const stubNarrow = (initiallyNarrow: boolean) => {
  let narrow = initiallyNarrow;
  let listeners: Array<() => void> = [];
  window.matchMedia = (query: string) =>
    ({
      get matches() {
        return narrow && query.includes("max-width");
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => {
        listeners = [...listeners, listener];
      },
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
  return (nextNarrow: boolean) => {
    narrow = nextNarrow;
    act(() => listeners.forEach((listener) => listener()));
  };
};

describe("AppHeader notifications", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    cleanup();
  });

  it("opens the notifications modal from the bell on a narrow viewport", () => {
    stubNarrow(true);
    renderHeader();

    fireEvent.click(screen.getByTestId("header-bell"));

    expect(screen.getByTestId("header-bell")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("notifications-modal")).toBeInTheDocument();
  });

  it("closes the modal on Escape and returns the bell to collapsed", () => {
    stubNarrow(true);
    renderHeader();
    fireEvent.click(screen.getByTestId("header-bell"));

    const dialog = screen.getByTestId("notifications-modal") as HTMLDialogElement;
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent(dialog, new Event("close"));

    expect(screen.queryByTestId("notifications-modal")).toBeNull();
    expect(screen.getByTestId("header-bell")).toHaveAttribute("aria-expanded", "false");
  });

  it("does not show the modal on a wide viewport", () => {
    stubNarrow(false);
    renderHeader();

    fireEvent.click(screen.getByTestId("header-bell"));

    expect(screen.queryByTestId("notifications-modal")).toBeNull();
  });

  it("opens the popover from the bell on a wide viewport, not the modal", () => {
    stubNarrow(false);
    renderHeader();

    fireEvent.click(screen.getByTestId("header-bell"));

    expect(screen.getByTestId("header-bell")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("notifications-popover")).toBeInTheDocument();
    expect(screen.queryByTestId("notifications-modal")).toBeNull();
  });

  it("closes the popover on Escape and returns the bell to collapsed", () => {
    stubNarrow(false);
    renderHeader();
    fireEvent.click(screen.getByTestId("header-bell"));

    const dialog = screen.getByTestId("notifications-popover") as HTMLDialogElement;
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent(dialog, new Event("close"));

    expect(screen.queryByTestId("notifications-popover")).toBeNull();
    expect(screen.getByTestId("header-bell")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the popover when the viewport turns narrow", () => {
    const setNarrow = stubNarrow(false);
    renderHeader();
    fireEvent.click(screen.getByTestId("header-bell"));

    setNarrow(true);

    expect(screen.queryByTestId("notifications-popover")).toBeNull();
    expect(screen.queryByTestId("notifications-modal")).toBeNull();
  });
});
