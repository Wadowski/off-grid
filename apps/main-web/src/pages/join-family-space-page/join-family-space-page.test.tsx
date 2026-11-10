// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CABIN_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const CREATED_AT = "2026-10-31T10:00:00.000Z";

const preview = {
  familyId: FAMILY_ID,
  familyName: "The Smiths",
  familyCreatedAt: CREATED_AT,
  invitedBy: { displayName: "Ada Smith" },
};

const familyList = {
  status: 200,
  body: {
    families: [
      { id: FAMILY_ID, name: "The Smiths", role: "member", accent: "blue", purpose: "household" },
    ],
  },
};

let App: typeof import("../../app.js").App;

describe("Join family space page", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/families/join");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("asks for a code before looking up an invitation", async () => {
    stubApi([...signedInStartup([]), familyList]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter an invitation code.")).toBeInTheDocument();
  });

  it("shows the family and who invited the person before joining", async () => {
    stubApi([...signedInStartup([]), familyList, { status: 200, body: preview }]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");

    fireEvent.change(screen.getByRole("textbox", { name: "Invitation code" }), {
      target: { value: "the-code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("The Smiths")).toBeInTheDocument();
    expect(
      screen.getByText("Ada Smith invited you to join The Smiths as a member."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept invitation & join space" })).toBeEnabled();
  });

  it("says the code is not valid when the server does not recognise it", async () => {
    stubApi([
      ...signedInStartup([]),
      familyList,
      { status: 404, body: { code: "NOT_FOUND", message: "Not found" } },
    ]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");

    fireEvent.change(screen.getByRole("textbox", { name: "Invitation code" }), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("That code isn't valid. Check it and try again."),
    ).toBeInTheDocument();
  });

  it("asks the person to wait when too many attempts were made", async () => {
    stubApi([
      ...signedInStartup([]),
      familyList,
      { status: 429, body: { code: "RATE_LIMITED", message: "Too many attempts" } },
    ]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");

    fireEvent.change(screen.getByRole("textbox", { name: "Invitation code" }), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Too many attempts. Wait a few minutes and try again."),
    ).toBeInTheDocument();
  });

  it("returns to the code step without joining when the invitation is declined", async () => {
    stubApi([...signedInStartup([]), familyList, { status: 200, body: preview }]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");
    fireEvent.change(screen.getByRole("textbox", { name: "Invitation code" }), {
      target: { value: "the-code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("The Smiths");

    fireEvent.click(screen.getByRole("button", { name: "Decline" }));

    expect(await screen.findByTestId("join-family-code-form")).toBeInTheDocument();
    expect(
      screen.queryByText("Ada Smith invited you to join The Smiths as a member."),
    ).not.toBeInTheDocument();
  });

  it("joins the family and switches to it when the invitation is accepted", async () => {
    const fetchMock = stubApi([
      ...signedInStartup([]),
      familyList,
      { status: 200, body: preview },
      { status: 201, body: { familyId: CABIN_ID } },
      { status: 200, body: {} },
      familyList,
    ]);
    render(<App />);
    await screen.findByTestId("join-family-code-form");
    fireEvent.change(screen.getByRole("textbox", { name: "Invitation code" }), {
      target: { value: "the-code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("The Smiths");

    fireEvent.click(screen.getByRole("button", { name: "Accept invitation & join space" }));

    await vi.waitFor(() => {
      const urls = fetchMock.mock.calls.map(([input]) => String(input));
      expect(urls.some((url) => url.endsWith("/families/join"))).toBe(true);
      expect(urls.some((url) => url.endsWith("/families/active"))).toBe(true);
    });
  });
});
