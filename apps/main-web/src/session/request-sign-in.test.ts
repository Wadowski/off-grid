// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { requestSignIn } from "./request-sign-in.js";
import { ServerUnreachableError } from "./server-unreachable-error.js";

vi.mock("../api/anonymous-api-client.js", () => ({
  anonymousAuthClient: { signIn: vi.fn() },
}));

const signInMock = vi.mocked(anonymousAuthClient.signIn);
const INPUT = { email: "anna@example.com", password: "correct horse battery" };

describe("requestSignIn", () => {
  beforeEach(() => {
    signInMock.mockReset();
  });

  it("returns the session when the server answers", async () => {
    const session = { user: { id: "1" }, accessToken: "token" };
    signInMock.mockResolvedValue(session as never);

    await expect(requestSignIn(INPUT)).resolves.toBe(session);
  });

  it("reports a request that never reached the server as unreachable", async () => {
    signInMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestSignIn(INPUT)).rejects.toBeInstanceOf(ServerUnreachableError);
  });

  it("passes a server error through unchanged", async () => {
    const error = new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    signInMock.mockRejectedValue(error);

    await expect(requestSignIn(INPUT)).rejects.toBe(error);
  });
});
