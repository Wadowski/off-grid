// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole } from "./types.js";

export const canManageFamilyMembers = (role: FamilyRole): boolean => role === "admin";
