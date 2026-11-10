// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CABIN_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const CREATED_AT = "2026-10-31T10:00:00.000Z";

let App: typeof import("../../app.js").App;

describe("Create family space page", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/families/new");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("offers household, getaway and extended purposes and selects one", async () => {
    stubApi([
      ...signedInStartup([{ id: FAMILY_ID, name: "Lakeside" }]),
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

    const getaway = await screen.findByRole("radio", { name: /Getaway/ });
    fireEvent.click(getaway);

    expect(getaway).toBeChecked();
    expect(screen.getByRole("radio", { name: /Household/ })).not.toBeChecked();
  });

  it("selects an accent colour", async () => {
    stubApi([
      ...signedInStartup([{ id: FAMILY_ID, name: "Lakeside" }]),
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

    const sage = await screen.findByRole("button", { name: "Sage" });
    fireEvent.click(sage);

    expect(sage).toHaveAttribute("aria-pressed", "true");
  });

  it("asks for a name before creating a space", async () => {
    stubApi([
      ...signedInStartup([{ id: FAMILY_ID, name: "Lakeside" }]),
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
    await screen.findByTestId("create-family-form");

    fireEvent.click(screen.getByTestId("create-family-submit"));

    expect(await screen.findByText("Enter a family name.")).toBeInTheDocument();
  });

  it("creates the space and goes to Family & Spaces settings", async () => {
    const fetchMock = stubApi([
      ...signedInStartup([{ id: FAMILY_ID, name: "Lakeside" }]),
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
      { status: 201, body: { id: CABIN_ID, name: "Cabin Circle", createdAt: CREATED_AT } },
      {
        status: 200,
        body: {
          families: [
            {
              id: CABIN_ID,
              name: "Cabin Circle",
              role: "admin",
              accent: "blue",
              purpose: "household",
            },
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
    await screen.findByTestId("create-family-form");

    fireEvent.change(screen.getByLabelText("Family or Household Name"), {
      target: { value: "Cabin Circle" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Sage$/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Getaway/ }));
    fireEvent.click(screen.getByTestId("create-family-submit"));

    await waitFor(() => expect(window.location.pathname).toBe("/settings/families"));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/families"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Cabin Circle", accent: "sage", purpose: "getaway" }),
      }),
    );
  });
});
