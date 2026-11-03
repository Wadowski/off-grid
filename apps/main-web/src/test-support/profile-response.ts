// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary } from "../types.js";
import { SIGNED_IN_USER_ID } from "./constants.js";
import type { FakeResponse } from "./types.js";

export const profileResponse = (families: readonly FamilySummary[] = []): FakeResponse => ({
  status: 200,
  body: {
    id: SIGNED_IN_USER_ID,
    email: "anna@example.com",
    displayName: "Anna Kowalska",
    instanceRole: "user",
    families,
  },
});
