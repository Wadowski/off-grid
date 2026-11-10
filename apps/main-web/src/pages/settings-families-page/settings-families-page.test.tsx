// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";
import { SIGNED_IN_USER_ID } from "../../test-support/constants.js";

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
      { status: 200, body: { members: [] } },
      { status: 204, body: undefined },
      { status: 200, body: { members: [] } },
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
      { status: 200, body: { members: [] } },
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
      { status: 200, body: { members: [] } },
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
  it("lists the household roster with names, and lets an admin change a role", async () => {
    const CABIN_MEMBER_ID = "0b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";
    const fetchMock = stubApi([
      ...signedInStartup([{ id: LAKESIDE_ID, name: "Lakeside" }]),
      { status: 200, body: { families: [LAKESIDE_ADMIN] } },
      {
        status: 200,
        body: {
          members: [
            {
              userId: SIGNED_IN_USER_ID,
              displayName: "Ana Spaces",
              role: "admin",
              joinedAt: "2026-10-31T10:00:00.000Z",
            },
            {
              userId: CABIN_MEMBER_ID,
              displayName: "Ben Spaces",
              role: "member",
              joinedAt: "2026-10-31T11:00:00.000Z",
            },
          ],
        },
      },
      { status: 204, body: undefined },
      {
        status: 200,
        body: {
          members: [
            {
              userId: SIGNED_IN_USER_ID,
              displayName: "Ana Spaces",
              role: "admin",
              joinedAt: "2026-10-31T10:00:00.000Z",
            },
            {
              userId: CABIN_MEMBER_ID,
              displayName: "Ben Spaces",
              role: "admin",
              joinedAt: "2026-10-31T11:00:00.000Z",
            },
          ],
        },
      },
    ]);
    render(<App />);

    const roster = await screen.findByTestId("family-roster");
    expect(within(roster).getByText("Ana Spaces")).toBeInTheDocument();
    expect(within(roster).getByText("You")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Role of Ben Spaces" }), {
      target: { value: "admin" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/families/${LAKESIDE_ID}/members/${CABIN_MEMBER_ID}`),
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ role: "admin" }) }),
      ),
    );
  });
});
