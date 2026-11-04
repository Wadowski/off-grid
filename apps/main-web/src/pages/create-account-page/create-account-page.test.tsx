// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../../test-support/json-response.js";
import type { FakeResponse } from "../../test-support/types.js";

const REFRESH_PATH = "/auth/refresh";
const REGISTRATION_STATUS_PATH = "/auth/registration-status";
const REGISTER_PATH = "/auth/register";

const ANONYMOUS: FakeResponse = {
  status: 401,
  body: { code: "UNAUTHORIZED", message: "No session" },
};
const FRESH_SERVER: FakeResponse = {
  status: 200,
  body: { freshServer: true, registrationOpen: true },
};
const EXISTING_SERVER: FakeResponse = {
  status: 200,
  body: { freshServer: false, registrationOpen: true },
};
const CLOSED_SERVER: FakeResponse = {
  status: 200,
  body: { freshServer: false, registrationOpen: false },
};
const EMAIL_TAKEN: FakeResponse = {
  status: 409,
  body: { code: "EMAIL_TAKEN", message: "An account with this email already exists" },
};
const RECOVERY_CODE = "ABCD-EFGH-IJKL-MNOP";
const CREATED_ACCOUNT: FakeResponse = {
  status: 201,
  body: {
    user: {
      id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
      email: "anna@example.com",
      displayName: "Anna",
      instanceRole: "admin",
    },
    recoveryCode: RECOVERY_CODE,
  },
};

const STRONG_PASSWORD = "correct horse battery";

const stubRoutes = (routes: Record<string, FakeResponse>) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = Object.keys(routes).find((candidate) => String(input).endsWith(candidate));
    if (path === undefined) {
      throw new Error(`Unexpected request: ${String(input)}`);
    }
    return jsonResponse(routes[path]!);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const serverRoutes = (registration: FakeResponse, register?: FakeResponse) => ({
  [REFRESH_PATH]: ANONYMOUS,
  [REGISTRATION_STATUS_PATH]: registration,
  ...(register === undefined ? {} : { [REGISTER_PATH]: register }),
});

const sentRegistration = (fetchMock: ReturnType<typeof stubRoutes>) =>
  fetchMock.mock.calls.some(([input]) => String(input).endsWith(REGISTER_PATH));

const fillForm = ({
  confirmation = STRONG_PASSWORD,
  password = STRONG_PASSWORD,
  email = "anna@example.com",
} = {}) => {
  fireEvent.change(screen.getByTestId("create-account-name"), { target: { value: "Anna" } });
  fireEvent.change(screen.getByTestId("create-account-email"), { target: { value: email } });
  fireEvent.change(screen.getByTestId("create-account-password"), { target: { value: password } });
  fireEvent.change(screen.getByTestId("create-account-confirmation"), {
    target: { value: confirmation },
  });
};

const submitForm = () => {
  fireEvent.click(screen.getByTestId("create-account-submit"));
};

let App: typeof import("../../app.js").App;

describe("Create account page", () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ App } = await import("../../app.js"));
    window.history.pushState({}, "", "/create-account");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the first-run heading on a fresh server", async () => {
    stubRoutes(serverRoutes(FRESH_SERVER));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Set up your Offgrid" })).toBeInTheDocument();
  });

  it("shows the regular heading when the server already has an admin", async () => {
    stubRoutes(serverRoutes(EXISTING_SERVER));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Create your account" })).toBeInTheDocument();
  });

  it("shows that registration is closed with a link to sign in", async () => {
    stubRoutes(serverRoutes(CLOSED_SERVER));

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Registration is closed" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-link")).toHaveAttribute("href", "/sign-in");
  });

  it("says a password under 12 characters is too weak and sends nothing", async () => {
    const fetchMock = stubRoutes(serverRoutes(EXISTING_SERVER, CREATED_ACCOUNT));
    render(<App />);
    await screen.findByRole("heading", { name: "Create your account" });

    fillForm({ password: "short", confirmation: "short" });
    submitForm();

    expect(await screen.findByText("Too weak. Use at least 12 characters.")).toBeInTheDocument();
    expect(sentRegistration(fetchMock)).toBe(false);
  });

  it("shows a mismatch error and sends nothing when the passwords differ", async () => {
    const fetchMock = stubRoutes(serverRoutes(EXISTING_SERVER, CREATED_ACCOUNT));
    render(<App />);
    await screen.findByRole("heading", { name: "Create your account" });

    fillForm({ confirmation: "something else entirely" });
    submitForm();

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(sentRegistration(fetchMock)).toBe(false);
  });

  it("tells the person the email is already in use", async () => {
    stubRoutes(serverRoutes(EXISTING_SERVER, EMAIL_TAKEN));
    render(<App />);
    await screen.findByRole("heading", { name: "Create your account" });

    fillForm();
    submitForm();

    expect(await screen.findByText("This email is already in use.")).toBeInTheDocument();
  });

  it("shows the recovery code with Continue disabled until the box is ticked", async () => {
    stubRoutes(serverRoutes(EXISTING_SERVER, CREATED_ACCOUNT));
    render(<App />);
    await screen.findByRole("heading", { name: "Create your account" });

    fillForm();
    submitForm();

    expect(await screen.findByTestId("recovery-code")).toHaveTextContent(RECOVERY_CODE);
    expect(screen.getByTestId("recovery-continue")).toBeDisabled();

    fireEvent.click(screen.getByTestId("recovery-saved-checkbox"));

    expect(screen.getByTestId("recovery-continue")).toBeEnabled();
  });
});
