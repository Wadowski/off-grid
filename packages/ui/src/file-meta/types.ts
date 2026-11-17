// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileDateLabel, FileEntryProps } from "../files/types.js";

export type FileMetaProps = Pick<
  FileEntryProps,
  "kind" | "sizeBytes" | "itemCount" | "modifiedAt" | "locale" | "now" | "timeZone"
> & {
  readonly id: string;
  readonly spread?: boolean;
};

export type FileModifiedProps = {
  readonly label: FileDateLabel;
};
