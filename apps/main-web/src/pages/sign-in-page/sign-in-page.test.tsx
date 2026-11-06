// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
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
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (!String(input).endsWith(REGISTRATION_STATUS_PATH)) {
      throw new Error(`Unexpected request: ${String(input)}`);
    }
    return jsonResponse(response);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const waitForRegistrationStatusToSettle = async (
  fetchMock: ReturnType<typeof stubRegistrationStatus>,
) => {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  await act(async () => {
    await fetchMock.mock.results[0]!.value;
  });
  await act(async () => undefined);
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

  it("hides account creation once registration is known to be closed", async () => {
    const fetchMock = stubRegistrationStatus(false);

    renderSignInPage();
    await waitForRegistrationStatusToSettle(fetchMock);

    expect(screen.queryByTestId("create-account-link")).not.toBeInTheDocument();
  });

  it("tells the person they were signed out when the session ended", async () => {
    stubRegistrationStatus(true);

    renderSignInPage({ reason: "sessionEnded" });

    expect(await screen.findByRole("alert")).toHaveTextContent("You were signed out");
  });
});
