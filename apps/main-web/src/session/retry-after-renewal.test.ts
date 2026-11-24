// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@offgrid/api-client";
import { clearAccessToken } from "./clear-access-token.js";
import { getAccessToken } from "./get-access-token.js";
import { getSessionState } from "./get-session-state.js";
import { retryAfterRenewal } from "./retry-after-renewal.js";
import { setSessionState } from "./set-session-state.js";
import { storeAccessToken } from "./store-access-token.js";

const renewSession = vi.hoisted(() => vi.fn<() => Promise<void>>());

vi.mock("./renew-session.js", () => ({ renewSession }));

const FUTURE = new Date(Date.now() + 15 * 60_000).toISOString();
const noRenewal = (): void => undefined;

describe("retryAfterRenewal", () => {
  beforeEach(() => {
    renewSession.mockReset();
    setSessionState({ status: "loading" });
    storeAccessToken("old-token", FUTURE, noRenewal);
  });

  afterEach(() => {
    clearAccessToken();
  });

  it("renews after a 401 and sends again with the renewed token", async () => {
    renewSession.mockImplementation(async () => {
      storeAccessToken("renewed-token", FUTURE, noRenewal);
    });
    const send = vi
      .fn<(token: string | null) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const response = await retryAfterRenewal(send);

    expect(response.status).toBe(200);
    expect(renewSession).toHaveBeenCalledTimes(1);
    expect(send.mock.calls.map(([token]) => token)).toEqual(["old-token", "renewed-token"]);
  });

  it("sends without a token and returns the 401 without renewing", async () => {
    clearAccessToken();
    const send = vi
      .fn<(token: string | null) => Promise<Response>>()
      .mockResolvedValue(new Response(null, { status: 401 }));

    const response = await retryAfterRenewal(send);

    expect(response.status).toBe(401);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(null);
    expect(renewSession).not.toHaveBeenCalled();
  });

  it("skips the renewal when another request already replaced the token", async () => {
    const send = vi
      .fn<(token: string | null) => Promise<Response>>()
      .mockImplementationOnce(async () => {
        storeAccessToken("newer-token", FUTURE, noRenewal);
        return new Response(null, { status: 401 });
      })
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const response = await retryAfterRenewal(send);

    expect(response.status).toBe(200);
    expect(renewSession).not.toHaveBeenCalled();
    expect(send).toHaveBeenLastCalledWith("newer-token");
  });

  it("returns the original 401 and keeps the session when the renewal fails with a server fault", async () => {
    renewSession.mockRejectedValue(new ApiError(500, "INTERNAL", "Internal server error"));
    const send = vi
      .fn<(token: string | null) => Promise<Response>>()
      .mockResolvedValue(new Response(null, { status: 401 }));

    const response = await retryAfterRenewal(send);

    expect(response.status).toBe(401);
    expect(send).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe("old-token");
    expect(getSessionState().status).not.toBe("signedOut");
  });

  it("ends the session when the renewal is refused", async () => {
    renewSession.mockRejectedValue(new ApiError(401, "UNAUTHENTICATED", "Sign in required."));
    const send = vi
      .fn<(token: string | null) => Promise<Response>>()
      .mockResolvedValue(new Response(null, { status: 401 }));

    const response = await retryAfterRenewal(send);

    expect(response.status).toBe(401);
    expect(getAccessToken()).toBeNull();
    expect(getSessionState()).toMatchObject({ status: "signedOut", reason: "sessionEnded" });
  });
});
