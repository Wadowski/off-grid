// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createApiClient, createAuthClient } from "./index.js";

const USER_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const EXPIRES_AT = "2026-11-03T10:15:00.000Z";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const authWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: "http://localhost:3000/api", fetch: transport });
  return { auth: createAuthClient(client), transport };
};

describe("createAuthClient", () => {
  it("sends the client request header when refreshing the session", async () => {
    const { auth, transport } = authWith(
      jsonResponse({ accessToken: "access", accessExpiresAt: EXPIRES_AT }),
    );

    await auth.refresh();

    expect(transport).toHaveBeenCalledWith("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: { accept: "application/json", "x-offgrid-request": "1" },
      body: undefined,
    });
  });

  it("sends the client request header when signing out", async () => {
    const { auth, transport } = authWith(new Response(null, { status: 204 }));

    await auth.signOut();

    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/sign-out",
      expect.objectContaining({
        method: "POST",
        headers: { accept: "application/json", "x-offgrid-request": "1" },
      }),
    );
  });

  it("parses a successful sign-in into the signed-in shape", async () => {
    const { auth } = authWith(
      jsonResponse({
        user: {
          id: USER_ID,
          email: "anna@example.com",
          displayName: "Anna",
          instanceRole: "admin",
        },
        accessToken: "access",
        accessExpiresAt: EXPIRES_AT,
      }),
    );

    await expect(
      auth.signIn({ email: "anna@example.com", password: "a long passphrase" }),
    ).resolves.toMatchObject({ accessToken: "access", user: { instanceRole: "admin" } });
  });

  it("rejects a refresh response that does not match the contract", async () => {
    const { auth } = authWith(jsonResponse({ accessToken: "" }));

    await expect(auth.refresh()).rejects.toThrow();
  });

  it("maps a refused refresh to an ApiError with the server code", async () => {
    const { auth } = authWith(
      jsonResponse({ code: "SESSION_ENDED", message: "Please sign in again" }, 401),
    );

    await expect(auth.refresh()).rejects.toMatchObject({
      status: 401,
      code: "SESSION_ENDED",
    });
  });
});
