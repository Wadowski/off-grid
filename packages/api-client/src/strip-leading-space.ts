// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const stripLeadingSpace = (value: string): string =>
  value.startsWith(" ") ? value.slice(1) : value;
