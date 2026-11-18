// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isShardSegment = (name: string): boolean => /^[0-9a-f]{2}$/.test(name);
