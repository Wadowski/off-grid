// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../../test-support/json-response.js";
import type { FakeResponse } from "../../test-support/types.js";
import { SignInPage } from "./sign-in-page.js";

const REGISTRATION_STATUS_PATH = "/auth/registration-status";

const stubRegistrationStatus = (registrationOpen: boolean) => {
  const response: FakeResponse = {
    status: 200,
    body: { freshServer: false, registrationOpen },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      if (!String(input).endsWith(REGISTRATION_STATUS_PATH)) {
        throw new Error(`Unexpected request: ${String(input)}`);
      }
      return jsonResponse(response);
    }),
  );
};

const renderSignInPage = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/sign-in", state }]}>
      <SignInPage />
    </MemoryRouter>,
  );

describe("SignInPage", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("offers account creation when registration is open", async () => {
    stubRegistrationStatus(true);

    renderSignInPage();

    expect(await screen.findByTestId("create-account-link")).toHaveAttribute(
      "href",
      "/create-account",
    );
  });

  it("hides account creation when registration is closed", async () => {
    stubRegistrationStatus(false);

    renderSignInPage();

    await screen.findByRole("heading", { name: "Sign in" });
    expect(screen.queryByTestId("create-account-link")).not.toBeInTheDocument();
    expect(screen.queryByText("Create an account")).not.toBeInTheDocument();
  });

  it("tells the person they were signed out when the session ended", async () => {
    stubRegistrationStatus(true);

    renderSignInPage({ reason: "sessionEnded" });

    expect(await screen.findByRole("alert")).toHaveTextContent("You were signed out");
  });
});
