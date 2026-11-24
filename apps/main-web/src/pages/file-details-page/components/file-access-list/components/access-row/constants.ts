// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileAccessRole } from "../../../../../../files/types.js";

export const ACCESS_ROLE_TEXT_IDS = {
  owner: "files.details.access.owner",
  admin: "files.details.access.admin",
  member: "files.details.access.member",
} as const satisfies Record<FileAccessRole, string>;
