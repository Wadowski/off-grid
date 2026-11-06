// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubApi } from "../../test-support/stub-api.js";
import { SignInPage } from "./sign-in-page.js";

const stubRegistrationStatus = (registrationOpen: boolean) =>
  stubApi([{ status: 200, body: { freshServer: false, registrationOpen } }]);

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
