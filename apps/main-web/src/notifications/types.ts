// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";

export type NotificationTextValues = Readonly<Record<string, string | number>>;

export type NotificationText = {
  readonly textId: ParseKeys;
  readonly values?: NotificationTextValues;
};

export type DayGroupLabel = NotificationText | { readonly value: string };

export type DayGroup<T> = {
  readonly dateKey: string;
  readonly label: DayGroupLabel;
  readonly items: readonly T[];
};

export type DatedItem = { readonly createdAt: string };
