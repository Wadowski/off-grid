// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem } from "../../types.js";

export type UploadQueueListProps = {
  readonly items: readonly UploadItem[];
  readonly testIdPrefix: string;
  readonly isIdle: boolean;
  readonly onClearFinished: () => void;
};
