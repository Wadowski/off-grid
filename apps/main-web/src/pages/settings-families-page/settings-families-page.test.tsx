// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const LAKESIDE_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CABIN_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

const LAKESIDE_ADMIN = {
  id: LAKESIDE_ID,
  name: "Lakeside",
  role: "admin",
  accent: "blue",
  purpose: "household",
};
const CABIN_MEMBER = {
  id: CABIN_ID,
  name: "Cabin Circle",
  role: "member",
  accent: "blue",
  purpose: "household",
};

let App: typeof import("../../app.js").App;

const rowFor = (name: string) =>
  within(screen.getByTestId("family-space-list"))
    .getByText(name)
    .closest<HTMLElement>("[data-testid='family-space-row']") as HTMLElement;

describe("Family and spaces settings", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/settings/families");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lists every space with the role the person has in it", async () => {
    stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN, CABIN_MEMBER] } },
    ]);

    render(<App />);

    expect(await screen.findByTestId("family-space-list")).toBeInTheDocument();
    expect(within(rowFor("Lakeside")).getByText("Admin")).toBeInTheDocument();
    expect(within(rowFor("Cabin Circle")).getByText("Member")).toBeInTheDocument();
  });

  it("switches the space the person acts in", async () => {
    const fetchMock = stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN, CABIN_MEMBER] } },
      { status: 204, body: undefined },
    ]);
    render(<App />);
    await screen.findByTestId("family-space-list");

    fireEvent.click(within(rowFor("Cabin Circle")).getByTestId("family-space-switch"));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/families/active"),
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ familyId: CABIN_ID }) }),
    );
    expect(await within(rowFor("Cabin Circle")).findByText("Active")).toBeInTheDocument();
  });

  it("removes a space the person leaves", async () => {
    stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN, CABIN_MEMBER] } },
      { status: 204, body: undefined },
      { status: 200, body: { families: [LAKESIDE_ADMIN] } },
    ]);
    render(<App />);
    await screen.findByTestId("family-space-list");

    fireEvent.click(within(rowFor("Cabin Circle")).getByTestId("family-space-leave"));

    await waitFor(() =>
      expect(
        within(screen.getByTestId("family-space-list")).getAllByTestId("family-space-row"),
      ).toHaveLength(1),
    );
    expect(within(screen.getByTestId("family-space-list")).queryByText("Cabin Circle")).toBeNull();
  });

  it("explains that the only admin cannot leave a space", async () => {
    stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN] } },
      {
        status: 409,
        body: { code: "LAST_ADMIN", message: "A family must keep at least one admin" },
      },
    ]);
    render(<App />);
    await screen.findByTestId("family-space-list");

    fireEvent.click(within(rowFor("Lakeside")).getByTestId("family-space-leave"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are the only admin of this space.",
    );
    expect(rowFor("Lakeside")).toBeInTheDocument();
  });

  it("selects a space by its card and marks the selected card", async () => {
    stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN, CABIN_MEMBER] } },
      { status: 200, body: { members: [] } },
    ]);
    render(<App />);
    await screen.findByTestId("family-space-list");

    fireEvent.click(within(rowFor("Cabin Circle")).getByTestId("family-space-select"));

    expect(await screen.findByTestId("family-member-list")).toBeInTheDocument();
    expect(within(rowFor("Cabin Circle")).getByTestId("family-space-select")).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(within(rowFor("Lakeside")).getByTestId("family-space-select")).not.toHaveAttribute(
      "aria-current",
    );
  });
});
