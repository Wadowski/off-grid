// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessGrantResponse } from "../test-support/access-grant-response.js";
import { sessionEndedResponse } from "../test-support/session-ended-response.js";
import { stubApi } from "../test-support/stub-api.js";
import { clearAccessToken } from "./clear-access-token.js";
import { getAccessToken } from "./get-access-token.js";
import { getSessionState } from "./get-session-state.js";
import { sendWithSession } from "./send-with-session.js";
import { setSessionState } from "./set-session-state.js";
import { storeAccessToken } from "./store-access-token.js";

const FAMILIES_URL = "/api/families";
const FUTURE = new Date(Date.now() + 15 * 60_000).toISOString();
const noRenewal = (): void => undefined;

const bearerOf = (init: RequestInit | undefined): string | null =>
  new Headers(init?.headers).get("authorization");

describe("sendWithSession", () => {
  beforeEach(() => {
    setSessionState({ status: "loading" });
    storeAccessToken("old-token", FUTURE, noRenewal);
  });

  afterEach(() => {
    clearAccessToken();
    vi.unstubAllGlobals();
  });

  it("renews the session once after a 401 and sends the request again", async () => {
    const fetchMock = stubApi([
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
      accessGrantResponse("renewed-token"),
      { status: 200, body: { families: [] } },
    ]);

    const response = await sendWithSession(FAMILIES_URL);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(bearerOf(fetchMock.mock.calls.at(-1)?.[1])).toBe("Bearer renewed-token");
  });

  it("uses a token another request already renewed, without a second refresh", async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockImplementationOnce(async () => {
        storeAccessToken("newer-token", FUTURE, noRenewal);
        return new Response(null, { status: 401 });
      })
      .mockImplementationOnce(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await sendWithSession(FAMILIES_URL);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bearerOf(fetchMock.mock.calls.at(-1)?.[1])).toBe("Bearer newer-token");
  });

  it("keeps the session and returns the 401 when the renewal fails with a server fault", async () => {
    stubApi([
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
      { status: 500, body: { code: "INTERNAL", message: "Internal server error" } },
    ]);

    const response = await sendWithSession(FAMILIES_URL);

    expect(response.status).toBe(401);
    expect(getAccessToken()).toBe("old-token");
    expect(getSessionState().status).not.toBe("signedOut");
  });

  it("ends the session when the server refuses the renewal", async () => {
    stubApi([
      { status: 401, body: { code: "UNAUTHENTICATED", message: "Sign in required." } },
      sessionEndedResponse(),
    ]);

    await sendWithSession(FAMILIES_URL);

    expect(getAccessToken()).toBeNull();
    expect(getSessionState()).toMatchObject({ status: "signedOut", reason: "sessionEnded" });
  });
});
