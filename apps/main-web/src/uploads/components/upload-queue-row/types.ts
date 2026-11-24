// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem } from "../../types.js";

export type UploadQueueRowProps = {
  readonly item: UploadItem;
  readonly testIdPrefix: string;
  readonly alertOnFailure: boolean;
};
