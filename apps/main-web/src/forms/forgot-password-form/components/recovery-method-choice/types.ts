// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RecoveryMethod } from "../../../../recovery/types.js";

export type RecoveryMethodChoiceProps = {
  readonly method: RecoveryMethod;
  readonly onSelect: (method: RecoveryMethod) => void;
};
