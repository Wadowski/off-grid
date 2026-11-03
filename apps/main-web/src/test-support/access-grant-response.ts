// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FakeResponse } from "./types.js";

export const accessGrantResponse = (accessToken = "test-access-token"): FakeResponse => ({
  status: 200,
  body: {
    accessToken,
    accessExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  },
});
