// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { accessGrantResponse } from "../test-support/access-grant-response.js";
import { stubApi } from "../test-support/stub-api.js";
import { clearAccessToken } from "./clear-access-token.js";
import { getAccessToken } from "./get-access-token.js";
import { renewSession } from "./renew-session.js";

describe("renewSession", () => {
  afterEach(() => {
    clearAccessToken();
    vi.unstubAllGlobals();
  });

  it("refreshes once for concurrent callers and stores the new access token", async () => {
    const fetchMock = stubApi([accessGrantResponse("renewed-token")]);

    await Promise.all([renewSession(), renewSession()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe("renewed-token");
  });
});
