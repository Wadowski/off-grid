// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsMobileHeader } from "./notifications-mobile-header.js";

describe("NotificationsMobileHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls onBack from the Back button", () => {
    const onBack = vi.fn();
    render(<NotificationsMobileHeader unreadCount={1} onBack={onBack} onMarkAllRead={vi.fn()} />);

    fireEvent.click(screen.getByTestId("notifications-back"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("disables mark all as read when no notice is unread", () => {
    render(<NotificationsMobileHeader unreadCount={0} onBack={vi.fn()} onMarkAllRead={vi.fn()} />);

    expect(screen.getByTestId("notifications-mark-all-read")).toBeDisabled();
  });
});
