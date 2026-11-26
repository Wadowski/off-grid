// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, MoveNotice, MoveSource } from "../../types.js";

export type MoveDialogProps = {
  readonly drives: readonly Drive[];
  readonly source: MoveSource;
  readonly narrow: boolean;
  readonly onClose: () => void;
  readonly onMoved: (notice: MoveNotice) => void;
};
