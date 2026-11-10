// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilySpace } from "../../../../types.js";

export type FamilySpaceRowProps = {
  readonly space: FamilySpace;
  readonly isActive: boolean;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onSwitch: () => void;
  readonly onLeave: () => void;
};
