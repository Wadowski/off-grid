// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MoveOutcome } from "../../types.js";
import { toFile } from "./to-file.js";

export const toMoveFileResult = (outcome: MoveOutcome) => ({
  file: toFile(outcome.file),
  crossOwnerNotice: outcome.crossOwnerNotice,
});
