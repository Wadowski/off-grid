// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventGuestsState } from "../types.js";
import { GuestsSection } from "./guests-section.js";

const BEN = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";

const stateWith = (overrides: Partial<EventGuestsState>): EventGuestsState => ({
  status: "ready",
  guests: [{ userId: BEN, invitedAt: "2026-11-20T10:00:00.000Z" }],
  retry: vi.fn(),
  ...overrides,
});

describe("GuestsSection", () => {
  afterEach(() => cleanup());

  it("lists the guests with their names and a count", () => {
    render(<GuestsSection state={stateWith({})} nameOf={() => "Ben"} readOnly={false} />);

    expect(screen.getByTestId("event-guests-section")).toHaveTextContent("Guests");
    expect(screen.getByTestId(`event-guest-${BEN}`)).toHaveTextContent("Ben");
  });

  it("names a guest without a known name Guest", () => {
    render(<GuestsSection state={stateWith({})} nameOf={() => undefined} readOnly={false} />);

    expect(screen.getByTestId(`event-guest-${BEN}`)).toHaveTextContent("Guest");
  });

  it("shows a muted line for the host when there are no guests", () => {
    render(
      <GuestsSection state={stateWith({ guests: [] })} nameOf={() => undefined} readOnly={false} />,
    );

    expect(screen.getByText("No guests yet")).toBeInTheDocument();
  });

  it("hides the section from a guest when there are no guests", () => {
    render(
      <GuestsSection state={stateWith({ guests: [] })} nameOf={() => undefined} readOnly={true} />,
    );

    expect(screen.queryByTestId("event-guests-section")).not.toBeInTheDocument();
  });

  it("shows an alert with a retry when the guests cannot be loaded", () => {
    render(
      <GuestsSection
        state={stateWith({ status: "failed", guests: [] })}
        nameOf={() => undefined}
        readOnly={false}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Guests could not be loaded");
  });
});
