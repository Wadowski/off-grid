// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationsListFooter } from "./notifications-list-footer.js";
import type { NotificationsListFooterProps } from "./types.js";

const renderFooter = (overrides: Partial<NotificationsListFooterProps>) =>
  render(
    <NotificationsListFooter
      layout="phone"
      shown={2}
      total={2}
      hasNextPage={false}
      loadMoreFailed={false}
      onLoadOlder={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );

describe("NotificationsListFooter", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows caught up on phone when the list has no next page", () => {
    renderFooter({ layout: "phone", hasNextPage: false });

    expect(screen.getByTestId("notifications-caught-up")).toHaveTextContent("You're caught up");
    expect(screen.queryByTestId("notifications-showing")).toBeNull();
  });

  it("offers Load older on phone when a next page exists and hides caught up", () => {
    const onLoadOlder = vi.fn().mockResolvedValue(undefined);
    renderFooter({ layout: "phone", hasNextPage: true, onLoadOlder });

    fireEvent.click(screen.getByTestId("notifications-load-older"));

    expect(onLoadOlder).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("notifications-caught-up")).toBeNull();
  });

  it("shows the showing count and no caught up on desktop", () => {
    renderFooter({ layout: "desktop", shown: 2, total: 7 });

    expect(screen.getByTestId("notifications-showing")).toHaveTextContent("Showing 2 of 7");
    expect(screen.queryByTestId("notifications-caught-up")).toBeNull();
  });

  it("shows the load more error text on either layout", () => {
    renderFooter({ layout: "phone", hasNextPage: true, loadMoreFailed: true });

    expect(screen.getByText("Older notifications could not be loaded.")).toBeInTheDocument();
  });
});
