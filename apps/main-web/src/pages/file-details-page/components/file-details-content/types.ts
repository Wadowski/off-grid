// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FileDetailsScreenState } from "../../../../files/types.js";

export type FileDetailsContentProps = {
  readonly driveId: Drive["id"];
  readonly screen: FileDetailsScreenState;
};
