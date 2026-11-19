// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const browserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
