// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const formatFileTimestamp = (timestamp: Date, language?: string): string =>
  new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
