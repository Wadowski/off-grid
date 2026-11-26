// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "../../../../files/types.js";

export type TrashHeaderProps = {
  readonly driveId: Drive["id"];
  readonly driveName: string | null;
};
