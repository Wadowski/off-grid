// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { userCreatedV1 } from "./user-created-v1.js";

describe("user-created-v1 payload", () => {
  it("accepts a user id and display name", () => {
    const payload = { userId: randomUUID(), displayName: "Ada" };

    expect(userCreatedV1.schema.parse(payload)).toEqual(payload);
  });

  it("drops an email address from the parsed payload", () => {
    const payload = { userId: randomUUID(), displayName: "Ada", email: "ada@example.com" };

    expect(Object.keys(userCreatedV1.schema.parse(payload))).not.toContain("email");
  });

  it("refuses a user id that is not a uuid", () => {
    expect(userCreatedV1.schema.safeParse({ userId: "nope", displayName: "Ada" }).success).toBe(
      false,
    );
  });
});
