// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DEV_USER_ID, DEV_IDENTITY_USER_HEADER } from "../constants.js";
import { devIdentityHeaders } from "./dev-identity-headers.js";

describe("devIdentityHeaders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends the stub identity header in development builds", () => {
    expect(devIdentityHeaders()).toEqual({ [DEV_IDENTITY_USER_HEADER]: DEFAULT_DEV_USER_ID });
  });

  it("sends no identity header in production builds", () => {
    vi.stubEnv("DEV", false);

    expect(devIdentityHeaders()).toEqual({});
  });
});
