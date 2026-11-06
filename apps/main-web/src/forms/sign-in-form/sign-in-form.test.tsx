// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServerUnreachableError } from "../../session/server-unreachable-error.js";
import { signIn } from "../../session/sign-in.js";
import { SignInForm } from "./sign-in-form.js";

vi.mock("../../session/sign-in.js", () => ({ signIn: vi.fn() }));

const signInMock = vi.mocked(signIn);

const ANNA_EMAIL = "anna@example.com";
const ANNA_PASSWORD = "correct horse battery";

const fillForm = ({ email, password }: { email: string; password: string }) => {
  fireEvent.change(screen.getByTestId("sign-in-email"), { target: { value: email } });
  fireEvent.change(screen.getByTestId("sign-in-password"), { target: { value: password } });
};

const submitForm = () => fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

describe("SignInForm", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signInMock.mockResolvedValue(undefined);
    render(<SignInForm />);
  });

  afterEach(() => {
    cleanup();
  });

  it("signs in with the email, password and remember-me choice", async () => {
    fillForm({ email: ANNA_EMAIL, password: ANNA_PASSWORD });
    fireEvent.click(screen.getByTestId("sign-in-remember-me"));

    submitForm();

    expect(signInMock).toHaveBeenCalledWith({
      email: ANNA_EMAIL,
      password: ANNA_PASSWORD,
      rememberMe: true,
    });
  });

  it("asks for a valid email and a password without calling the server", () => {
    fillForm({ email: "not-an-email", password: "" });

    submitForm();

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("keeps the email and clears the password after a wrong password", async () => {
    signInMock.mockRejectedValue(
      new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect"),
    );
    fillForm({ email: ANNA_EMAIL, password: "wrong password here" });

    submitForm();

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect");
    expect(screen.getByTestId("sign-in-email")).toHaveValue(ANNA_EMAIL);
    expect(screen.getByTestId("sign-in-password")).toHaveValue("");
  });

  it("explains when the server cannot be reached", async () => {
    signInMock.mockRejectedValue(new ServerUnreachableError());
    fillForm({ email: ANNA_EMAIL, password: ANNA_PASSWORD });

    submitForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The Offgrid server cannot be reached.",
    );
  });

  it("does not send a second request while the first one is still running", () => {
    signInMock.mockReturnValue(new Promise(() => undefined));
    fillForm({ email: ANNA_EMAIL, password: ANNA_PASSWORD });

    fireEvent.submit(screen.getByTestId("sign-in-form"));
    fireEvent.submit(screen.getByTestId("sign-in-form"));

    expect(signInMock).toHaveBeenCalledTimes(1);
  });

  it("disables the button while the sign-in request is running", () => {
    signInMock.mockReturnValue(new Promise(() => undefined));
    fillForm({ email: ANNA_EMAIL, password: ANNA_PASSWORD });

    submitForm();

    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
  });

  it("shows and hides the password when the eye button is pressed", () => {
    fillForm({ email: ANNA_EMAIL, password: ANNA_PASSWORD });
    const passwordInput = screen.getByTestId("sign-in-password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("warns when Caps Lock is on while typing the password", () => {
    const passwordInput = screen.getByTestId("sign-in-password");
    const keyDown = createEvent.keyDown(passwordInput, { key: "A" });
    Object.defineProperty(keyDown, "getModifierState", { value: () => true });

    fireEvent(passwordInput, keyDown);

    expect(screen.getByRole("status")).toHaveTextContent("Caps Lock is on.");
  });
});
