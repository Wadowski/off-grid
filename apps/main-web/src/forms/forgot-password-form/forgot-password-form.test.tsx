// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import { ForgotPasswordForm } from "./forgot-password-form.js";

vi.mock("../../api/anonymous-api-client.js", () => ({
  anonymousAuthClient: { requestEmailCode: vi.fn() },
}));

const requestEmailCodeMock = vi.mocked(anonymousAuthClient.requestEmailCode);

const ResetLocation = () => {
  const location = useLocation();
  return <p data-testid="location">{JSON.stringify(location.state)}</p>;
};

const renderForm = (emailCodeAvailable: boolean) =>
  render(
    <MemoryRouter initialEntries={["/forgot-password"]}>
      <Routes>
        <Route
          path="/forgot-password"
          element={<ForgotPasswordForm emailCodeAvailable={emailCodeAvailable} />}
        />
        <Route path="/reset-password" element={<ResetLocation />} />
        <Route path="/sign-in" element={<p>Sign in page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const typeEmail = (email: string) =>
  fireEvent.change(screen.getByTestId("forgot-password-email"), { target: { value: email } });

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    requestEmailCodeMock.mockReset();
    requestEmailCodeMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it("hides the emailed code option while email is not set up", () => {
    renderForm(false);

    expect(screen.queryByText("Email me a code")).not.toBeInTheDocument();
    expect(screen.queryByTestId("forgot-password-methods")).not.toBeInTheDocument();
  });

  it("offers both methods while email is set up", () => {
    renderForm(true);

    expect(screen.getByText("Use my recovery code")).toBeInTheDocument();
    expect(screen.getByText("Email me a code")).toBeInTheDocument();
  });

  it("asks for a valid email before continuing", () => {
    renderForm(true);
    typeEmail("nope");

    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
  });

  it("continues to the reset screen with the recovery code method", () => {
    renderForm(true);
    typeEmail("anna@example.com");

    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    expect(screen.getByTestId("location")).toHaveTextContent(
      JSON.stringify({ email: "anna@example.com", method: "recoveryCode" }),
    );
    expect(requestEmailCodeMock).not.toHaveBeenCalled();
  });

  it("requests an emailed code before continuing with the emailed code method", async () => {
    renderForm(true);
    typeEmail("anna@example.com");
    fireEvent.click(screen.getByText("Email me a code"));

    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        JSON.stringify({ email: "anna@example.com", method: "emailCode" }),
      ),
    );
    expect(requestEmailCodeMock).toHaveBeenCalledWith({ email: "anna@example.com" });
  });

  it("returns to sign in when cancelled", () => {
    renderForm(true);

    fireEvent.click(screen.getByTestId("forgot-password-cancel"));

    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });
});
