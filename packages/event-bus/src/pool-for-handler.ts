// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Pool } from "pg";
import { TRANSPORT_RUN_AS } from "./constants.js";

export const poolForHandler = (
  busPool: Pool,
  poolForRole: (runAs: string) => Pool,
  runAs: string,
): Pool => (runAs === TRANSPORT_RUN_AS ? busPool : poolForRole(runAs));
