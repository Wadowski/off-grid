// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, "");
