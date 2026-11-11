// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../../test-support/json-response.js";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { SIGNED_IN_USER_ID } from "../../test-support/constants.js";
import type { FakeResponse } from "../../test-support/types.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const SAM_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const INVITATION_ID = "5b6c7d8e-9f01-4a2b-8c3d-4e5f6a7b8c9d";
const CODE = "ABCD-EFGH-IJKL";

const SMITHS_ADMIN = {
  id: FAMILY_ID,
  name: "The Smiths",
  role: "admin",
  accent: "blue",
  purpose: "household",
};
const SMITHS_MEMBER = { ...SMITHS_ADMIN, role: "member" };

const me = {
  userId: SIGNED_IN_USER_ID,
  displayName: "Anna Kowalska",
  role: "admin",
  joinedAt: "2026-11-01T10:00:00.000Z",
};
const sam = {
  userId: SAM_ID,
  displayName: "Sam Smith",
  role: "member",
  joinedAt: "2026-11-02T10:00:00.000Z",
};

type Route = (method: string, path: string) => FakeResponse;

const routeApi = (startup: FakeResponse[], route: Route) => {
  const queue = [...startup];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const next = queue.shift();
    if (next !== undefined) {
      return jsonResponse(next);
    }
    const path = new URL(String(input), "http://localhost").pathname;
    return jsonResponse(route(init?.method ?? "GET", path));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

let App: typeof import("../../app.js").App;

const renderManager = async (families: readonly unknown[], members: readonly unknown[]) => {
  routeApi(signedInStartup([{ id: FAMILY_ID, name: "The Smiths" }]), (method, path) => {
    if (path === "/api/families" && method === "GET") {
      return { status: 200, body: { families } };
    }
    if (path === `/api/families/${FAMILY_ID}/members` && method === "GET") {
      return { status: 200, body: { members } };
    }
    throw new Error(`Unexpected request ${method} ${path}`);
  });
  render(<App />);
};

describe("Family manager screen", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", `/settings/families/${FAMILY_ID}`);
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  }, 120_000);

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows an admin each member with their name and role", async () => {
    await renderManager([SMITHS_ADMIN], [me, sam]);

    const rows = await screen.findAllByTestId("family-member-row");
    expect(within(rows[0] as HTMLElement).getByText("Anna Kowalska")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByText("Sam Smith")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    expect(within(rows[1] as HTMLElement).getByTestId("family-member-role")).toHaveValue("member");
  });

  it("shows each role as a tag and marks the person themself", async () => {
    await renderManager([SMITHS_ADMIN], [me, sam]);

    const rows = await screen.findAllByTestId("family-member-row");
    expect(within(rows[0] as HTMLElement).getByText("Admin")).toBeInTheDocument();
    expect(within(rows[0] as HTMLElement).getByText("You")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByText("Member")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).queryByText("You")).toBeNull();
    expect(screen.queryByTestId("family-member-role")).toBeNull();
  });

  it("shows a member the list without any admin actions", async () => {
    await renderManager([SMITHS_MEMBER], [me, sam]);

    await screen.findAllByTestId("family-member-row");
    expect(screen.queryByTestId("family-member-role")).toBeNull();
    expect(screen.queryByTestId("family-member-remove")).toBeNull();
    expect(screen.queryByRole("button", { name: "Invite someone" })).toBeNull();
  });

  it("changes a member's role and refreshes the list", async () => {
    const fetchMock = routeApi(
      signedInStartup([{ id: FAMILY_ID, name: "The Smiths" }]),
      (method, path) => {
        if (method === "PATCH") {
          return { status: 200, body: { ...sam, role: "admin" } };
        }
        if (path === "/api/families") {
          return { status: 200, body: { families: [SMITHS_ADMIN] } };
        }
        return { status: 200, body: { members: [me, sam] } };
      },
    );
    render(<App />);
    const rows = await screen.findAllByTestId("family-member-row");
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));

    fireEvent.change(within(rows[1] as HTMLElement).getByTestId("family-member-role"), {
      target: { value: "admin" },
    });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/families/${FAMILY_ID}/members/${SAM_ID}`),
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ role: "admin" }) }),
      ),
    );
  });

  it("explains that the only admin cannot be demoted", async () => {
    routeApi(signedInStartup([{ id: FAMILY_ID, name: "The Smiths" }]), (method, path) => {
      if (method === "PATCH") {
        return {
          status: 409,
          body: { code: "LAST_ADMIN", message: "A family must keep at least one admin" },
        };
      }
      if (path === "/api/families") {
        return { status: 200, body: { families: [SMITHS_ADMIN] } };
      }
      return { status: 200, body: { members: [me] } };
    });
    render(<App />);
    const row = (await screen.findAllByTestId("family-member-row"))[0] as HTMLElement;
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));

    fireEvent.change(within(row).getByTestId("family-member-role"), {
      target: { value: "member" },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A family must keep at least one admin.",
    );
  });

  it("removes a member from the list", async () => {
    const fetchMock = routeApi(
      signedInStartup([{ id: FAMILY_ID, name: "The Smiths" }]),
      (method, path) => {
        if (method === "DELETE") {
          return { status: 204, body: undefined };
        }
        if (path === "/api/families") {
          return { status: 200, body: { families: [SMITHS_ADMIN] } };
        }
        return { status: 200, body: { members: [me, sam] } };
      },
    );
    render(<App />);
    const rows = await screen.findAllByTestId("family-member-row");
    fireEvent.click(screen.getByRole("button", { name: "Manage" }));

    fireEvent.click(within(rows[1] as HTMLElement).getByTestId("family-member-remove"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/families/${FAMILY_ID}/members/${SAM_ID}`),
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });

  it("shows an invitation code once and revokes it from the dialog", async () => {
    const fetchMock = routeApi(
      signedInStartup([{ id: FAMILY_ID, name: "The Smiths" }]),
      (method, path) => {
        if (method === "POST" && path.endsWith("/invitations")) {
          return {
            status: 201,
            body: {
              invitationId: INVITATION_ID,
              code: CODE,
              expiresAt: "2026-11-17T10:00:00.000Z",
            },
          };
        }
        if (method === "DELETE") {
          return { status: 204, body: undefined };
        }
        if (path === "/api/families") {
          return { status: 200, body: { families: [SMITHS_ADMIN] } };
        }
        return { status: 200, body: { members: [me] } };
      },
    );
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Invite someone" }));
    const dialog = await screen.findByTestId("family-invite-dialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "Create invitation code" }));

    expect(await within(dialog).findByTestId("family-invite-code")).toHaveTextContent(CODE);
    fireEvent.click(within(dialog).getByRole("button", { name: "Revoke invitation" }));

    expect(
      await within(dialog).findByText("Invitation revoked. The code no longer works."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/invitations/${INVITATION_ID}`),
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(within(dialog).queryByTestId("family-invite-code")).toBeNull();
  });
});
