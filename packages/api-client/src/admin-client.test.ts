// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createAdminClient, createApiClient } from "./index.js";

const USER_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";
const CREATED_AT = "2026-11-03T10:15:00.000Z";
const BASE_URL = "http://localhost:3000/api";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const adminWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { admin: createAdminClient(client), transport };
};

describe("createAdminClient", () => {
  it("parses the user list", async () => {
    const { admin, transport } = adminWith(
      jsonResponse({
        users: [
          {
            id: USER_ID,
            email: "tom@example.com",
            displayName: "Tom",
            instanceRole: "user",
            status: "active",
            createdAt: CREATED_AT,
          },
        ],
      }),
    );

    await expect(admin.users()).resolves.toMatchObject({ users: [{ displayName: "Tom" }] });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/admin/users`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("disables an account by user id in the path", async () => {
    const { admin, transport } = adminWith(new Response(null, { status: 204 }));

    await admin.disableUser(USER_ID);

    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/admin/users/${USER_ID}/disable`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("parses the one-time code issued by a password reset", async () => {
    const { admin } = adminWith(
      jsonResponse({ userId: USER_ID, code: "ABCD-EFGH-JKLM", expiresAt: CREATED_AT }, 201),
    );

    await expect(admin.startPasswordReset(USER_ID)).resolves.toMatchObject({
      code: "ABCD-EFGH-JKLM",
    });
  });

  it("sends the registration switch with a patch", async () => {
    const { admin, transport } = adminWith(jsonResponse({ registrationOpen: false }));

    await expect(admin.updateInstanceSettings({ registrationOpen: false })).resolves.toEqual({
      registrationOpen: false,
    });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/admin/instance-settings`,
      expect.objectContaining({ method: "PATCH", body: '{"registrationOpen":false}' }),
    );
  });

  it("sends a test email with the mail settings", async () => {
    const { admin, transport } = adminWith(jsonResponse({ sent: true }));

    await admin.sendTestMail({
      provider: "gmail",
      email: "anna@gmail.com",
      password: "app password",
    });

    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/admin/mail-settings/test`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
