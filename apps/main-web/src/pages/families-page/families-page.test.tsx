// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CREATED_AT = "2026-10-31T10:00:00.000Z";

const fillName = (value: string) => {
  fireEvent.change(screen.getByLabelText("Family name"), { target: { value } });
};

const submitForm = () => {
  fireEvent.click(screen.getByTestId("create-family-submit"));
};

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

  it("shows the empty state when the caller has no families", async () => {
    stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);

    render(<App />);

    expect(await screen.findByTestId("family-list-empty")).toHaveTextContent(
      "You are not in any family yet.",
    );
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

  it("shows an inline error and sends nothing when the name is blank", async () => {
    const fetchMock = stubApi([...signedInStartup(), { status: 200, body: { families: [] } }]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("   ");
    submitForm();

    expect(await screen.findByText("Enter a family name.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("creates a family and shows it in the list from one refetch", async () => {
    const fetchMock = stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [] } },
      { status: 201, body: { id: FAMILY_ID, name: "Lakeside", createdAt: CREATED_AT } },
      { status: 200, body: { families: [{ id: FAMILY_ID, name: "Lakeside" }] } },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("Lakeside");
    submitForm();

    expect(await screen.findByTestId("family-list-item")).toHaveTextContent("Lakeside");
    expect(fetchMock).toHaveBeenCalledTimes(5);
    const postCall = fetchMock.mock.calls.find(
      ([input, init]) => init?.method === "POST" && String(input).endsWith("/api/families"),
    );
    expect(new URL(String(postCall?.[0])).pathname).toBe("/api/families");
    expect(postCall?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ name: "Lakeside" }),
      credentials: "include",
    });
    expect(new Headers(postCall?.[1]?.headers).get("authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("shows a failure message when the family cannot be created", async () => {
    stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [] } },
      { status: 500, body: { code: "INTERNAL", message: "Internal server error" } },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-empty");

    fillName("Lakeside");
    submitForm();

    expect(
      await screen.findByText("The family could not be created. Try again."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Family name")).toHaveValue("Lakeside");
  });
});
