// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const defaultRetryDelayMs = (attempt: number): number => 100 * 2 ** (attempt - 1);
