// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";

export type SwatchPickerProps<T extends string> = {
  readonly headingId: string;
  readonly headingTextId: ParseKeys;
  readonly options: readonly T[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly labelTextIds: Record<T, ParseKeys>;
  readonly backgroundOf: (value: T) => string;
  readonly testIdPrefix: string;
};
