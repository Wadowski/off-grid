// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent } from "@offgrid/contracts";

export type AccentPickerProps = {
  readonly value: FamilyAccent;
  readonly onChange: (accent: FamilyAccent) => void;
};
