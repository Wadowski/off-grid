// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySummary } from "../types.js";
import { accessGrantResponse } from "./access-grant-response.js";
import { profileResponse } from "./profile-response.js";
import type { FakeResponse } from "./types.js";

export const signedInStartup = (families: readonly FamilySummary[] = []): FakeResponse[] => [
  accessGrantResponse(),
  profileResponse(families),
];
