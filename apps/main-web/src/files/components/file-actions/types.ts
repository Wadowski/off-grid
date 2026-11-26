// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, MoveNotice, RegularFileEntry } from "../../types.js";

export type FileActionsMoveProps = {
  readonly drives: readonly Drive[];
  readonly onMoved: (notice: MoveNotice) => void;
};

export type FileActionsProps = {
  readonly file: RegularFileEntry;
  readonly move?: FileActionsMoveProps;
};
