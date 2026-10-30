// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TableRow } from "./types.js";
import { OWNERSHIP_SCOPES, SCOPE_COMMENT } from "./constants.js";

export const scopeViolation = (row: Omit<TableRow, "schema">): string | null => {
  const match = row.comment?.match(SCOPE_COMMENT);
  if (!match) {
    return "no ownership scope declared (call public.offgrid_declare_scope)";
  }
  const scope = match[1] ?? "";
  if (!(OWNERSHIP_SCOPES as readonly string[]).includes(scope)) {
    return `unknown ownership scope "${scope}"`;
  }
  if (scope === "shared") {
    return row.has_family || row.has_user ? "shared table has an owner column" : null;
  }
  if (!row.rls) {
    return `scope ${scope} requires row level security`;
  }
  const needsFamily = scope === "family" || scope === "family-or-user";
  const needsUser = scope === "user" || scope === "family-or-user";
  if (needsFamily && !row.has_family) return `scope ${scope} requires family_id`;
  if (needsUser && !row.has_user) return `scope ${scope} requires user_id`;
  return null;
};
