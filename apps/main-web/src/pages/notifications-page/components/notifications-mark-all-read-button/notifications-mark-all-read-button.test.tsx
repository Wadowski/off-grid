// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsMarkAllReadButton } from "./notifications-mark-all-read-button.js";

describe("NotificationsMarkAllReadButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("is disabled when no notice is unread", () => {
    render(<NotificationsMarkAllReadButton unreadCount={0} onMarkAllRead={vi.fn()} />);

    expect(screen.getByTestId("notifications-mark-all-read")).toBeDisabled();
  });

  it("calls onMarkAllRead when unread notices exist", () => {
    const onMarkAllRead = vi.fn();
    render(<NotificationsMarkAllReadButton unreadCount={2} onMarkAllRead={onMarkAllRead} />);

    const button = screen.getByRole("button", { name: "Mark all as read" });
    expect(button).toBeEnabled();
    fireEvent.click(button);

    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });
});
