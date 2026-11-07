// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signedInStartup } from "../../test-support/signed-in-startup.js";
import { stubApi } from "../../test-support/stub-api.js";

const FAMILY_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const OTHER_FAMILY_ID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
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

  it("lists the families the person belongs to", async () => {
    stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [{ id: FAMILY_ID, name: "Lakeside" }] } },
    ]);

    render(<App />);

    expect(await screen.findByTestId("family-list-item")).toHaveTextContent("Lakeside");
    expect(window.location.pathname).toBe("/");
  });

  it("creates another family from the home page and lists it next to the existing one", async () => {
    stubApi([
      ...signedInStartup(),
      { status: 200, body: { families: [{ id: FAMILY_ID, name: "Lakeside" }] } },
      { status: 201, body: { id: OTHER_FAMILY_ID, name: "Hillside", createdAt: CREATED_AT } },
      {
        status: 200,
        body: {
          families: [
            { id: FAMILY_ID, name: "Lakeside" },
            { id: OTHER_FAMILY_ID, name: "Hillside" },
          ],
        },
      },
    ]);
    render(<App />);
    await screen.findByTestId("family-list-item");

    fillName("Hillside");
    submitForm();

    await waitFor(() => expect(screen.getAllByTestId("family-list-item")).toHaveLength(2));
    expect(window.location.pathname).toBe("/");
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
