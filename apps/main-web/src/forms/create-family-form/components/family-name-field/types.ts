// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyNameErrorTextId } from "../../../../types.js";

export type FamilyNameFieldProps = {
  readonly value: string;
  readonly errorTextId: FamilyNameErrorTextId | undefined;
  readonly onChange: (value: string) => void;
};
