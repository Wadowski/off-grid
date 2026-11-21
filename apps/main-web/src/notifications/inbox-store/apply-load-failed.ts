// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxState } from "./types.js";

export const applyLoadFailed = (state: InboxState): InboxState => ({
  ...state,
  status: "error",
  errorKind: "load",
});
