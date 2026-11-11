// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CREATED_AT = "2026-10-31T10:00:00.000Z";
const WELCOME_HEADING = "Create a Family Space";

const fillName = (value: string) => {
  fireEvent.change(screen.getByLabelText("Family or Household Name"), { target: { value } });
};

const submitForm = () => {
  fireEvent.click(screen.getByTestId("create-family-submit"));
};

let App: typeof import("../../app.js").App;

describe("First family page", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/");
  }, 120_000);

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("asks a person with no family to create one", async () => {
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByText(WELCOME_HEADING)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/welcome");
  });

  it("explains that an invitation is the other way in", async () => {
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(
      await screen.findByText("Were you invited? Ask the family organizer to add you."),
    ).toBeInTheDocument();
  });

  it("shows a sign out button on the create-family step", async () => {
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByTestId("first-family-sign-out")).toBeInTheDocument();
  });

  it("creates the family and lands on the home page as its member", async () => {
    const fetchMock = stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [] } },
      { status: 201, body: { id: FAMILY_ID, name: "Lakeside", createdAt: CREATED_AT } },
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
    await screen.findByText(WELCOME_HEADING);

    fillName("Lakeside");
    submitForm();

    expect(await screen.findByTestId("family-space-row")).toHaveTextContent("Lakeside");
    expect(window.location.pathname).toBe("/");
    expect(fetchMock).toHaveBeenCalledTimes(5);
    const postCall = fetchMock.mock.calls.find(
      ([input, init]) => init?.method === "POST" && String(input).endsWith("/api/families"),
    );
    expect(postCall?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ name: "Lakeside" }),
      credentials: "include",
    });
    expect(new Headers(postCall?.[1]?.headers).get("authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("shows an inline error and sends nothing when the name is blank", async () => {
    const fetchMock = stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);
    render(<App />);
    await screen.findByText(WELCOME_HEADING);

    fillName("   ");
    submitForm();

    expect(await screen.findByText("Enter a family name.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("shows a failure message and keeps the name when the family cannot be created", async () => {
    stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [] } },
      { status: 500, body: { code: "INTERNAL", message: "Internal server error" } },
    ]);
    render(<App />);
    await screen.findByText(WELCOME_HEADING);

    fillName("Lakeside");
    submitForm();

    expect(
      await screen.findByText("The family could not be created. Try again."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Family or Household Name")).toHaveValue("Lakeside");
    expect(window.location.pathname).toBe("/welcome");
  });

  it("stays on the create-family step after a reload", async () => {
    window.history.pushState({}, "", "/welcome");
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByText(WELCOME_HEADING)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/welcome");
  });

  it("sends a person who already has a family straight to the home page", async () => {
    window.history.pushState({}, "", "/welcome");
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
    expect(window.location.pathname).toBe("/");
    expect(screen.queryByText(WELCOME_HEADING)).not.toBeInTheDocument();
  });
});
