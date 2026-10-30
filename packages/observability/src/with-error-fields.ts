// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const withErrorFields = (value: object): object =>
  value instanceof Error ? { ...value, name: value.name, message: value.message } : value;
