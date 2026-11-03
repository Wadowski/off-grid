// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FakeResponse } from "./types.js";

export const sessionEndedResponse = (): FakeResponse => ({
  status: 401,
  body: { code: "SESSION_ENDED", message: "Please sign in again" },
});
