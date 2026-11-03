// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InstanceRole } from "../../types.js";

export const initialInstanceRole = (existingUserCount: number): InstanceRole =>
  existingUserCount === 0 ? "admin" : "user";
