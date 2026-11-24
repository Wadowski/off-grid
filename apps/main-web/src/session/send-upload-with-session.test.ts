// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "./clear-access-token.js";
import { sendUploadWithSession } from "./send-upload-with-session.js";
import { setSessionState } from "./set-session-state.js";
import { storeAccessToken } from "./store-access-token.js";

const sendUploadXhr = vi.hoisted(() =>
  vi.fn<(url: string, init: { headers: Record<string, string> }) => Promise<Response>>(),
);
const renewSession = vi.hoisted(() => vi.fn<() => Promise<void>>());

vi.mock("@offgrid/api-client", () => ({ sendUploadXhr }));
vi.mock("./renew-session.js", () => ({ renewSession }));

const UPLOAD_URL = "http://localhost/api/drives/1/files";
const FUTURE = new Date(Date.now() + 15 * 60_000).toISOString();
const noRenewal = (): void => undefined;
const BLOB = new Blob(["hello"]);

const uploadInit = (headers: Readonly<Record<string, string>> = {}) => ({
  method: "POST" as const,
  headers,
  body: BLOB,
});

const authorizationSentAt = (call: number): string | undefined =>
  sendUploadXhr.mock.calls[call]?.[1].headers.authorization;

describe("sendUploadWithSession", () => {
  beforeEach(() => {
    sendUploadXhr.mockReset();
    renewSession.mockReset();
    setSessionState({ status: "loading" });
    storeAccessToken("old-token", FUTURE, noRenewal);
  });

  afterEach(() => {
    clearAccessToken();
  });

  it("sends the upload with the bearer token and keeps the caller headers", async () => {
    sendUploadXhr.mockResolvedValue(new Response("{}", { status: 201 }));

    await sendUploadWithSession(UPLOAD_URL, uploadInit({ "x-offgrid-file-name": "a.txt" }));

    expect(authorizationSentAt(0)).toBe("Bearer old-token");
    expect(sendUploadXhr.mock.calls[0]?.[1].headers["x-offgrid-file-name"]).toBe("a.txt");
  });

  it("renews the session once after a 401 and sends the upload again with the new token", async () => {
    sendUploadXhr
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response("{}", { status: 201 }));
    renewSession.mockImplementation(async () => {
      storeAccessToken("renewed-token", FUTURE, noRenewal);
    });

    const response = await sendUploadWithSession(UPLOAD_URL, uploadInit());

    expect(response.status).toBe(201);
    expect(renewSession).toHaveBeenCalledTimes(1);
    expect(authorizationSentAt(1)).toBe("Bearer renewed-token");
  });

  it("returns the 401 without a renewal when no token was sent", async () => {
    clearAccessToken();
    sendUploadXhr.mockResolvedValue(new Response(null, { status: 401 }));

    const response = await sendUploadWithSession(UPLOAD_URL, uploadInit());

    expect(response.status).toBe(401);
    expect(renewSession).not.toHaveBeenCalled();
    expect(sendUploadXhr).toHaveBeenCalledTimes(1);
  });
});
