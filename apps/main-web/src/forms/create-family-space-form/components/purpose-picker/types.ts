// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SpacePurposeId } from "../../constants.js";

export type PurposePickerProps = {
  readonly value: SpacePurposeId;
  readonly onChange: (purpose: SpacePurposeId) => void;
};
