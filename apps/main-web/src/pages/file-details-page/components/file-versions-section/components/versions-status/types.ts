// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../../../types.js";
import type { FilesErrorTextId } from "../../../../../../files/types.js";

export type VersionsStatusProps = {
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly onRetry: () => Promise<void>;
};
