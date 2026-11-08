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

  it("sends the new display name when updating the profile", async () => {
    const { auth, transport } = authWith(new Response(null, { status: 204 }));

    await auth.updateProfile({ displayName: "Anna Kowalska" });

    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/me",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ displayName: "Anna Kowalska" }),
      }),
    );
  });

  it("sends both passwords when changing the password", async () => {
    const { auth, transport } = authWith(new Response(null, { status: 204 }));

    await auth.changePassword({ currentPassword: "old passphrase", newPassword: "new passphrase" });

    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/me/password",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ currentPassword: "old passphrase", newPassword: "new passphrase" }),
      }),
    );
  });

  it("deletes the session named in the path when ending one session", async () => {
    const sessionId = "c0ffee00-1111-4222-8333-944444444444";
    const { auth, transport } = authWith(new Response(null, { status: 204 }));

    await auth.endSession(sessionId);

    expect(transport).toHaveBeenCalledWith(
      `http://localhost:3000/api/me/sessions/${sessionId}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("parses the session list into the contract shape", async () => {
    const sessionId = "c0ffee00-1111-4222-8333-944444444444";
    const { auth } = authWith(
      jsonResponse({
        sessions: [
          {
            id: sessionId,
            deviceLabel: "Laptop",
            createdAt: EXPIRES_AT,
            lastUsedAt: EXPIRES_AT,
            current: true,
          },
        ],
      }),
    );

    await expect(auth.sessions()).resolves.toMatchObject({
      sessions: [{ id: sessionId, deviceLabel: "Laptop", current: true }],
    });
  });

  it("returns the new recovery code when regenerating it", async () => {
    const { auth, transport } = authWith(jsonResponse({ recoveryCode: "ABCD-EFGH-IJKL" }, 201));

    await expect(auth.regenerateRecoveryCode({ password: "a long passphrase" })).resolves.toEqual({
      recoveryCode: "ABCD-EFGH-IJKL",
    });
    expect(transport).toHaveBeenCalledWith(
      "http://localhost:3000/api/me/recovery-code",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
