// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFamilyStatus, FamilyAppearance } from "../../types.js";

export type CreateFamilySpaceFormProps = {
  readonly status: CreateFamilyStatus;
  readonly onSubmit: (name: string, appearance: FamilyAppearance) => Promise<boolean>;
};
