// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccentId } from "../../constants.js";

export type AccentPickerProps = {
  readonly value: AccentId;
  readonly onChange: (accent: AccentId) => void;
};
