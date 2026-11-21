// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

let App: typeof import("../../app.js").App;

describe("notifications route", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/notifications");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the inbox page inside the app shell", async () => {
    stubApi([
      ...signedInStartup(),
      {
        status: 200,
        body: {
          families: [
            {
              id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
              name: "Lakeside",
              role: "admin",
              accent: "blue",
              purpose: "household",
            },
          ],
        },
      },
      {
        status: 200,
        body: { notifications: [], unreadCount: 0, nextCursor: null, total: 0 },
      },
    ]);

    render(<App />);

    expect(await screen.findByTestId("notifications-page")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(screen.getByTestId("notifications-page"));
  }, 15_000);
});
