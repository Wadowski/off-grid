// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFamilyStatus } from "../../types.js";

export type CreateFamilyFormProps = {
  readonly status: CreateFamilyStatus;
  readonly onSubmit: (name: string) => Promise<boolean>;
};
