// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { ServerUnreachableError } from "../../session/server-unreachable-error.js";
import { mapSignInError } from "./map-sign-in-error.js";

describe("mapSignInError", () => {
  it("treats a refused password as invalid credentials", () => {
    const error = new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");

    expect(mapSignInError(error)).toEqual({ kind: "invalidCredentials" });
  });

  it("treats a request that never reached the server as unreachable", () => {
    expect(mapSignInError(new ServerUnreachableError())).toEqual({ kind: "unreachable" });
  });

  it("does not report a programming error as an unreachable server", () => {
    expect(mapSignInError(new TypeError("Cannot read properties of undefined"))).toEqual({
      kind: "failed",
    });
  });

  it("treats any other server error as a generic failure", () => {
    const error = new ApiError(429, "RATE_LIMITED", "Too many requests");

    expect(mapSignInError(error)).toEqual({ kind: "failed" });
  });
});
