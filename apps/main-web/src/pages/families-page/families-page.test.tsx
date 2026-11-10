// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";

let App: typeof import("../../app.js").App;

describe("Families page", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lists the families the person belongs to with their role", async () => {
    stubApi([
      ...signedInStartup(),
      {
        status: 200,
        body: {
          families: [
            {
              id: FAMILY_ID,
              name: "Lakeside",
              role: "admin",
              accent: "blue",
              purpose: "household",
            },
          ],
        },
      },
    ]);

    render(<App />);

    expect(await screen.findByTestId("family-space-row")).toHaveTextContent("Lakeside");
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("opens the create family space screen from the create family space button", async () => {
    stubApi([
      ...signedInStartup(),
      {
        status: 200,
        body: {
          families: [
            {
              id: FAMILY_ID,
              name: "Lakeside",
              role: "admin",
              accent: "blue",
              purpose: "household",
            },
          ],
        },
      },
    ]);
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Create Family Space" }));

    expect(window.location.pathname).toBe("/families/new");
  });

  it("shows an alert when the family list cannot be loaded", async () => {
    stubApi([
      ...signedInStartup(),
      { status: 500, body: { code: "INTERNAL", message: "Internal server error" } },
    ]);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your families could not be loaded.",
    );
  });
});
