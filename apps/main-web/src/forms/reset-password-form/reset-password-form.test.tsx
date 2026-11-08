// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import { ResetPasswordForm } from "./reset-password-form.js";

vi.mock("../../api/anonymous-api-client.js", () => ({
  anonymousAuthClient: {
    recoverWithRecoveryCode: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const recoverMock = vi.mocked(anonymousAuthClient.recoverWithRecoveryCode);
const resetMock = vi.mocked(anonymousAuthClient.resetPassword);

const STRONG = "correct horse battery";

const fillAndSubmit = ({
  code,
  password,
  confirmation,
}: {
  code: string;
  password: string;
  confirmation: string;
}) => {
  fireEvent.change(screen.getByTestId("reset-password-code"), { target: { value: code } });
  fireEvent.change(screen.getByTestId("reset-password-password"), { target: { value: password } });
  fireEvent.change(screen.getByTestId("reset-password-confirmation"), {
    target: { value: confirmation },
  });
  fireEvent.click(screen.getByTestId("reset-password-submit"));
};

const renderForm = (
  onRecovered = vi.fn(),
  method: "recoveryCode" | "emailCode" = "recoveryCode",
) => {
  render(<ResetPasswordForm email="anna@example.com" method={method} onRecovered={onRecovered} />);
  return onRecovered;
};

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    recoverMock.mockReset();
    resetMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("asks for the code and nothing is sent when it is blank", () => {
    renderForm();

    fillAndSubmit({ code: " ", password: STRONG, confirmation: STRONG });

    expect(screen.getByText("Enter the code.")).toBeInTheDocument();
    expect(recoverMock).not.toHaveBeenCalled();
  });

  it("uses the recovery code endpoint and hands the new code to the caller", async () => {
    recoverMock.mockResolvedValue({ recoveryCode: "NEW-CODE" });
    const onRecovered = renderForm();

    fillAndSubmit({ code: "OLD-CODE", password: STRONG, confirmation: STRONG });

    await waitFor(() => expect(onRecovered).toHaveBeenCalledWith("NEW-CODE"));
    expect(recoverMock).toHaveBeenCalledWith({
      email: "anna@example.com",
      recoveryCode: "OLD-CODE",
      password: STRONG,
    });
  });

  it("uses the emailed code endpoint for the emailed method", async () => {
    resetMock.mockResolvedValue({ recoveryCode: "NEW-CODE" });
    const onRecovered = renderForm(vi.fn(), "emailCode");

    fillAndSubmit({ code: "123456", password: STRONG, confirmation: STRONG });

    await waitFor(() => expect(onRecovered).toHaveBeenCalledWith("NEW-CODE"));
    expect(resetMock).toHaveBeenCalledWith({
      email: "anna@example.com",
      code: "123456",
      password: STRONG,
    });
  });

  it("shows a wrong code under the code field", async () => {
    recoverMock.mockRejectedValue(new ApiError(400, "INVALID_RECOVERY_CODE", "x"));
    renderForm();

    fillAndSubmit({ code: "WRONG", password: STRONG, confirmation: STRONG });

    expect(await screen.findByText(/wrong or has expired/)).toBeInTheDocument();
  });

  it("shows the locked message when too many attempts were made", async () => {
    recoverMock.mockRejectedValue(new ApiError(429, "RECOVERY_LOCKED", "x"));
    renderForm();

    fillAndSubmit({ code: "WRONG", password: STRONG, confirmation: STRONG });

    expect(
      await screen.findByText("Too many attempts. Wait a few minutes and try again."),
    ).toBeInTheDocument();
  });

  it("puts a rejected password under the password field", async () => {
    recoverMock.mockRejectedValue(new ApiError(400, "PASSWORD_TOO_COMMON", "x"));
    renderForm();

    fillAndSubmit({ code: "CODE", password: STRONG, confirmation: STRONG });

    expect(
      await screen.findByText("This password is too common. Choose another."),
    ).toBeInTheDocument();
  });

  it("shows a generic failure for any other error", async () => {
    recoverMock.mockRejectedValue(new Error("network"));
    renderForm();

    fillAndSubmit({ code: "CODE", password: STRONG, confirmation: STRONG });

    expect(
      await screen.findByText("Your password could not be reset. Try again."),
    ).toBeInTheDocument();
  });
});
