// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error.js";
import { resolveRequestContext } from "./resolve-request-context.js";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const FAMILY_ID = "22222222-2222-4222-8222-222222222222";
const GROUP_ONE = "33333333-3333-4333-8333-333333333333";
const GROUP_TWO = "44444444-4444-4444-8444-444444444444";

describe("resolveRequestContext", () => {
  it("ignores identity headers unless the dev identity stub is enabled", () => {
    const context = resolveRequestContext({ "x-offgrid-user-id": USER_ID }, false);

    expect(context).toEqual({ userId: null, familyId: null, accessGroupIds: [] });
  });

  it("reads the stubbed user, family and access groups when the dev identity stub is enabled", () => {
    const context = resolveRequestContext(
      {
        "x-offgrid-user-id": USER_ID,
        "x-offgrid-family-id": FAMILY_ID,
        "x-offgrid-access-group-ids": `${GROUP_ONE}, ${GROUP_TWO}`,
      },
      true,
    );

    expect(context).toEqual({
      userId: USER_ID,
      familyId: FAMILY_ID,
      accessGroupIds: [GROUP_ONE, GROUP_TWO],
    });
  });

  it("returns an empty context when no identity headers are sent", () => {
    expect(resolveRequestContext({}, true)).toEqual({
      userId: null,
      familyId: null,
      accessGroupIds: [],
    });
  });

  it("rejects a malformed user id with a 400 that names the header", () => {
    const attempt = () => resolveRequestContext({ "x-offgrid-user-id": "not-a-uuid" }, true);

    expect(attempt).toThrow(ApiError);
    expect(attempt).toThrow("x-offgrid-user-id must be a valid identifier");
  });

  it("rejects a repeated header instead of picking one value", () => {
    expect(() =>
      resolveRequestContext({ "x-offgrid-family-id": [FAMILY_ID, FAMILY_ID] }, true),
    ).toThrow(ApiError);
  });
});
