// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationSchema, type Notice, type NotificationType } from "@offgrid/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCard } from "./notification-card.js";

const NOW = new Date("2026-11-19T10:03:00Z");

const notice = (overrides: Partial<Record<keyof Notice, unknown>> = {}): Notice =>
  notificationSchema.parse({
    id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
    type: "event-invited",
    category: "calendar",
    data: { eventId: "3d2e1f00-8a7b-4c6d-9e5f-0a1b2c3d4e5f" },
    createdAt: "2026-11-19T10:00:00Z",
    readAt: null,
    ...overrides,
  });

const readNotice = (type: NotificationType = "event-invited") =>
  notice({ type, readAt: "2026-11-19T10:01:00Z" });

const renderCard = (
  subject: Notice,
  handlers: { onOpen?: () => void; onMarkRead?: () => void } = {},
  density: "compact" | "full" = "compact",
) => {
  const onOpen = handlers.onOpen ?? vi.fn();
  const onMarkRead = handlers.onMarkRead ?? vi.fn();
  const view = render(
    <NotificationCard notice={subject} density={density} onOpen={onOpen} onMarkRead={onMarkRead} />,
  );
  return { ...view, onOpen, onMarkRead };
};

describe("NotificationCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("names the card by its title, category, time and unread state", () => {
    renderCard(notice({ type: "password-changed", category: "account-security" }));

    const activator = screen.getByRole("button", { name: /Your password was changed/ });
    expect(activator).toHaveAccessibleName(/Account & security/);
    expect(activator).toHaveAccessibleName(/3m ago/);
    expect(activator).toHaveAccessibleName(/unread$/);
  });

  it("names the card by its title, category, time and read state once read", () => {
    renderCard(
      notice({
        type: "password-changed",
        category: "account-security",
        readAt: "2026-11-19T10:01:00Z",
      }),
    );

    const activator = screen.getByRole("button", { name: /Your password was changed/ });
    expect(activator).toHaveAccessibleName(/Account & security/);
    expect(activator).toHaveAccessibleName(/3m ago/);
    expect(activator).toHaveAccessibleName(/read$/);
    expect(activator).not.toHaveAccessibleName(/unread/);
  });

  it("keeps the body visible and part of the accessible name", () => {
    renderCard(notice({ type: "event-invited" }));

    const activator = screen.getByTestId("notification-card-activate");
    expect(activator).toHaveAccessibleName(/Open the event to see the details and respond\./);
  });

  it("does not nest the View Event action inside the activator", () => {
    renderCard(notice({ type: "event-invited" }));

    expect(
      screen.getByTestId("notification-card-activate").querySelector("button"),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "View Event" })).toBeInTheDocument();
  });

  it("shows the unread dot only for an unread notice", () => {
    const { unmount } = renderCard(notice());

    expect(screen.getByTestId("notification-card-unread-dot")).toBeInTheDocument();
    unmount();

    renderCard(readNotice());

    expect(screen.queryByTestId("notification-card-unread-dot")).not.toBeInTheDocument();
  });

  it.each([
    ["calendar", "Calendar"],
    ["account-security", "Account & security"],
  ] as const)("labels a %s notice as %s", (category, label) => {
    renderCard(notice({ category }));

    expect(screen.getByTestId("notification-card-category")).toHaveTextContent(label);
  });

  it.each(["event-invited", "event-reminder"] as const)(
    "opens the event for %s without marking it read",
    (type) => {
      const subject = notice({ type });
      const { onOpen, onMarkRead } = renderCard(subject);

      fireEvent.click(screen.getByRole("button", { name: "View Event" }));

      expect(onOpen).toHaveBeenCalledWith(subject);
      expect(onMarkRead).not.toHaveBeenCalled();
    },
  );

  it.each(["password-changed", "recovery-code-regenerated"] as const)(
    "shows no action for %s",
    (type) => {
      renderCard(notice({ type }));

      expect(screen.queryByTestId("notification-card-action")).not.toBeInTheDocument();
    },
  );

  it("marks an unread notice read on click", () => {
    const subject = notice();
    const { onMarkRead } = renderCard(subject);

    fireEvent.click(screen.getByTestId("notification-card-activate"));

    expect(onMarkRead).toHaveBeenCalledTimes(1);
    expect(onMarkRead).toHaveBeenCalledWith(subject.id);
  });

  it("activates as a native button, so Enter and Space work without a key handler", () => {
    renderCard(notice());

    expect(screen.getByTestId("notification-card-activate").tagName).toBe("BUTTON");
    expect(screen.getByTestId("notification-card-activate")).toHaveAttribute("type", "button");
  });

  it("does not mark a read notice read on activation", () => {
    const { onMarkRead } = renderCard(readNotice());

    fireEvent.click(screen.getByTestId("notification-card-activate"));

    expect(onMarkRead).not.toHaveBeenCalled();
  });

  it("shows the relative time from the creation time", () => {
    renderCard(notice());

    expect(screen.getByTestId("notification-card-time")).toHaveTextContent("3m ago");
  });

  it.each(["compact", "full"] as const)("renders the same content at %s density", (density) => {
    renderCard(notice({ type: "event-reminder", category: "calendar" }), {}, density);

    expect(screen.getByTestId("notification-card")).toHaveAttribute("data-density", density);
    expect(screen.getByTestId("notification-card-title")).toHaveTextContent("Event reminder");
    expect(screen.getByTestId("notification-card-body")).toHaveTextContent(
      "An event you set a reminder for is coming up.",
    );
    expect(screen.getByRole("button", { name: "View Event" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderCard(notice());

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  });
});
