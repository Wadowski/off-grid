// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyPurpose } from "@offgrid/contracts";

export type PurposePickerProps = {
  readonly value: FamilyPurpose;
  readonly onChange: (purpose: FamilyPurpose) => void;
};
