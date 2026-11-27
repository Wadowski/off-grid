// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MoveNotice } from "../../../../files/types.js";

export type MoveResultNoticeProps = {
  readonly notice: MoveNotice | null;
  readonly onDismiss: () => void;
};
