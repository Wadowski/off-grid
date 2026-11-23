// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NotificationsInboxContext } from "../../../../../../notifications/inbox-context/notifications-inbox-context.js";
import type {
  NotificationItem,
  NotificationsInbox,
} from "../../../../../../notifications/inbox-store/types.js";
import { useNotificationsSurface } from "./use-notifications-surface.js";

const noticeOf = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id: "notice-1",
  type: "event-reminder",
  category: "calendar",
  data: { eventId: "event-1" },
  createdAt: new Date().toISOString(),
  readAt: null,
  ...overrides,
});

const renderSurface = (markRead = vi.fn(async () => undefined)) => {
  const inbox = { markRead } as unknown as NotificationsInbox;
  const dialog = document.createElement("dialog");
  const close = vi.fn();
  dialog.close = close;
  const rendered = renderHook(
    () => ({ surface: useNotificationsSurface(), location: useLocation() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NotificationsInboxContext.Provider value={inbox}>
          <MemoryRouter initialEntries={["/calendar"]}>{children}</MemoryRouter>
        </NotificationsInboxContext.Provider>
      ),
    },
  );
  rendered.result.current.surface.dialogRef.current = dialog;
  return { ...rendered, markRead, close };
};

describe("useNotificationsSurface", () => {
  it("navigates to the full notifications page and closes the surface on view all", () => {
    const { result, close } = renderSurface();

    act(() => {
      result.current.surface.viewAll();
    });

    expect(result.current.location.pathname).toBe("/notifications");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("marks an event notice read and closes the surface when it opens the event", async () => {
    const { result, markRead, close } = renderSurface();

    await act(async () => {
      await result.current.surface.openFromSurface(noticeOf({ id: "reminder" }));
    });

    expect(markRead).toHaveBeenCalledWith("reminder");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("marks a notice without an event read and keeps the surface open", async () => {
    const { result, markRead, close } = renderSurface();

    await act(async () => {
      await result.current.surface.openFromSurface(
        noticeOf({ id: "security", category: "account-security", data: {} }),
      );
    });

    expect(markRead).toHaveBeenCalledWith("security");
    expect(close).not.toHaveBeenCalled();
  });
});
