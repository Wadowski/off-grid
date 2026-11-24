// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileAccessRole } from "../../../../../../files/types.js";

export type AccessRowProps = {
  readonly name: string | null;
  readonly role: FileAccessRole;
  readonly isFirst: boolean;
};
