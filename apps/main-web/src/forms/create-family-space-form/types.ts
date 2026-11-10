// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFamilyStatus } from "../../types.js";
import type { AccentId, SpacePurposeId } from "./constants.js";

export type CreateFamilySpaceFormProps = {
  readonly status: CreateFamilyStatus;
  readonly onSubmit: (name: string) => Promise<boolean>;
};

export type FamilySpaceAppearance = {
  readonly accent: AccentId;
  readonly purpose: SpacePurposeId;
};
