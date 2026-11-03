// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { freshServerResponse } from "../test-support/fresh-server-response.js";
import { sessionEndedResponse } from "../test-support/session-ended-response.js";
import { signedInStartup } from "../test-support/signed-in-startup.js";
import { stubApi } from "../test-support/stub-api.js";

const openAt = (path: string) => {
  window.history.pushState({}, "", path);
};

const RENEWED_TOKEN = "renewed-access-token";

let App: typeof import("../app.js").App;

describe("web session routes", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../app.js"));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("sends a person who is not signed in to the sign-in page", async () => {
    openAt("/");
    stubApi([
      sessionEndedResponse(),
      { status: 200, body: { freshServer: false, registrationOpen: true } },
    ]);

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/sign-in");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sends a signed-in person from the sign-in page to home", async () => {
    openAt("/sign-in");
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByTestId("family-list-empty")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("sends a fresh server to the first-account page", async () => {
    openAt("/");
    stubApi([sessionEndedResponse(), freshServerResponse()]);

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Create account" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/create-account");
  });

  it("renews an expired access token without asking for a password", async () => {
    openAt("/");
    const fetchMock = stubApi([
      ...signedInStartup(),
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
      {
        status: 200,
        body: {
          accessToken: RENEWED_TOKEN,
          accessExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        },
      },
      { status: 200, body: { families: [] } },
    ]);

    render(<App />);

    expect(await screen.findByTestId("family-list-empty")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
    const lastCall = fetchMock.mock.calls.at(-1);
    expect(new Headers(lastCall?.[1]?.headers).get("authorization")).toBe(
      `Bearer ${RENEWED_TOKEN}`,
    );
  });

  it("sends the person to sign-in with a message when the session can no longer be renewed", async () => {
    openAt("/");
    stubApi([
      ...signedInStartup(),
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
      sessionEndedResponse(),
    ]);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("You were signed out");
    expect(window.location.pathname).toBe("/sign-in");
  });

  it("signs out from the user menu and closes the protected pages", async () => {
    openAt("/");
    const fetchMock = stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [] } },
      { status: 204, body: undefined },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/sign-in");
    const signOutCall = fetchMock.mock.calls.at(-1);
    expect(String(signOutCall?.[0])).toMatch(/\/api\/auth\/sign-out$/);
    expect(new Headers(signOutCall?.[1]?.headers).get("x-offgrid-request")).toBe("1");
  });
});
